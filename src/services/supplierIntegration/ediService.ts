import { supabase } from '@/boot/supabase';
import { orderLogger } from '@/utils/logger';
import type {
  SupplierOrder,
  OrderSendingResult,
} from '@/stores/orderLists/orderLists-supplier-splitting';
import type { Tables } from '@/types';

export interface EDIConfig {
  edi_endpoint: string;
  edi_partner_id: string;
  edi_interchange_id?: string;
  edi_test_mode?: boolean;
  edi_username?: string;
  edi_password?: string;
  edi_format?: 'ORDERS' | 'X12_850' | 'EDIFACT_ORDERS';
}

export interface EDIOrderItem {
  line_number: number;
  sku: string;
  quantity: number;
  unit_price: number;
  description?: string;
  uom?: string; // Unit of Measure
}

export interface EDIOrder {
  order_number: string;
  order_date: string;
  delivery_date?: string;
  buyer_party: {
    gln?: string;
    name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  supplier_party: {
    gln?: string;
    name: string;
    edi_partner_id: string;
  };
  items: EDIOrderItem[];
  currency: string;
  total_amount: number;
  notes?: string;
}

export class EDIService {
  /**
   * Send order via EDI/XML
   */
  async sendOrderViaEDI(
    order: SupplierOrder,
    orderReference: string
  ): Promise<OrderSendingResult> {
    try {
      orderLogger.info(
        `Sending order ${orderReference} via EDI to supplier ${order.supplier_name}`
      );

      // Get supplier EDI configuration
      const { data: supplier, error: supplierError } = await supabase
        .from('suppliers')
        .select('integration_config, name, code')
        .eq('id', order.supplier_id)
        .single<Tables<'suppliers'>>();

      if (supplierError || !supplier) {
        throw new Error('Supplier not found');
      }

      const rawConfig = supplier.integration_config;
      if (
        !rawConfig ||
        typeof rawConfig !== 'object' ||
        Array.isArray(rawConfig)
      ) {
        throw new Error('EDI configuration incomplete');
      }

      const ediConfig = rawConfig as Partial<EDIConfig>;
      if (!ediConfig.edi_endpoint || !ediConfig.edi_partner_id) {
        throw new Error('EDI configuration incomplete');
      }

      // Get practice details for buyer party
      const { data: practice, error: practiceError } = await supabase
        .from('practices')
        .select('name, address, city, postal_code, country')
        .eq('id', order.practice_id)
        .single<Tables<'practices'>>();

      if (practiceError || !practice) {
        throw new Error('Practice details not found');
      }

      // Build EDI order
      const ediOrder: EDIOrder = {
        order_number: orderReference,
        order_date: new Date().toISOString().split('T')[0] ?? '',
        delivery_date: order.estimated_delivery_date,
        buyer_party: {
          gln:
            (
              supplier.integration_config as
                | { buyer_gln?: string }
                | null
                | undefined
            )?.buyer_gln ?? '',
          name: practice.name ?? '',
          address: practice.address ?? '',
          city: practice.city ?? '',
          postal_code: practice.postal_code ?? '',
          country: practice.country ?? '',
        },
        supplier_party: {
          gln: ediConfig.edi_partner_id,
          name: supplier.name,
          edi_partner_id: ediConfig.edi_partner_id,
        },
        items: order.items.map((item, index) => ({
          line_number: index + 1,
          sku: item.supplier_sku || item.product_sku || '',
          quantity: item.quantity,
          unit_price: item.unit_price ?? 0,
          description: item.product_name ?? item.product_sku ?? '',
          uom: 'PCE', // Default to pieces, could be configurable
        })),
        currency: 'EUR',
        total_amount: order.items.reduce(
          (sum, item) => sum + item.total_price,
          0
        ),
        notes: `Automated order from Remcura for ${practice.name ?? ''}`,
      };

      // Generate XML based on EDI format
      let xmlContent: string;
      switch (ediConfig.edi_format || 'ORDERS') {
        case 'EDIFACT_ORDERS':
          xmlContent = this.generateEDIFACTXML(ediOrder);
          break;
        case 'X12_850':
          xmlContent = this.generateX12XML(ediOrder);
          break;
        default:
          xmlContent = this.generateGenericOrderXML(ediOrder);
      }

      // Send to EDI endpoint
      const response = await this.sendToEDIEndpoint(
        ediConfig as EDIConfig,
        xmlContent,
        orderReference
      );

      // Record the order in supplier_orders table
      await this.recordSupplierOrder(order, orderReference, 'edi', response);

      return {
        supplier_id: order.supplier_id,
        supplier_name: order.supplier_name,
        status: response.success ? 'success' : 'failed',
        method_used: 'edi',
        order_reference: orderReference,
        sent_at: new Date().toISOString(),
        error_message: response.success ? '' : (response.error ?? ''),
        delivery_expected: order.estimated_delivery_date ?? '',
      } satisfies OrderSendingResult;
    } catch (error: any) {
      orderLogger.error(
        `EDI order sending failed for ${orderReference}:`,
        error
      );

      return {
        supplier_id: order.supplier_id,
        supplier_name: order.supplier_name,
        status: 'failed',
        method_used: 'edi',
        order_reference: orderReference,
        sent_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : String(error),
        delivery_expected: order.estimated_delivery_date ?? '',
      } satisfies OrderSendingResult;
    }
  }

  /**
   * Generate EDIFACT ORDERS D.96A XML
   */
  private generateEDIFACTXML(order: EDIOrder): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z/, '');

    return `<?xml version="1.0" encoding="UTF-8"?>
<EDIFACT_ORDERS>
  <UNH>
    <MessageReferenceNumber>${order.order_number}</MessageReferenceNumber>
    <MessageType>ORDERS</MessageType>
    <Version>D</Version>
    <Release>96A</Release>
  </UNH>
  <BGM>
    <DocumentMessageName>220</DocumentMessageName>
    <DocumentMessageNumber>${order.order_number}</DocumentMessageNumber>
    <MessageFunction>9</MessageFunction>
  </BGM>
  <DTM>
    <DateTimePeriod>
      <DateTimePeriodQualifier>137</DateTimePeriodQualifier>
      <DateTimePeriod>${timestamp}</DateTimePeriod>
      <DateTimePeriodFormatQualifier>102</DateTimePeriodFormatQualifier>
    </DateTimePeriod>
  </DTM>
  <NAD_BY>
    <PartyQualifier>BY</PartyQualifier>
    <PartyIdentificationDetails>
      <PartyIdIdentification>${order.buyer_party.gln}</PartyIdIdentification>
    </PartyIdentificationDetails>
    <NameAndAddress>
      <NameAndAddressLine>${order.buyer_party.name}</NameAndAddressLine>
      <NameAndAddressLine>${order.buyer_party.address}</NameAndAddressLine>
      <NameAndAddressLine>${order.buyer_party.postal_code} ${
        order.buyer_party.city
      }</NameAndAddressLine>
      <CountryCode>${order.buyer_party.country}</CountryCode>
    </NameAndAddress>
  </NAD_BY>
  <NAD_SU>
    <PartyQualifier>SU</PartyQualifier>
    <PartyIdentificationDetails>
      <PartyIdIdentification>${order.supplier_party.gln}</PartyIdIdentification>
    </PartyIdentificationDetails>
  </NAD_SU>
  ${order.items
    .map(
      item => `
  <LIN>
    <LineItemNumber>${item.line_number}</LineItemNumber>
    <ItemNumberIdentification>
      <ItemNumber>${item.sku}</ItemNumber>
      <ItemNumberType>SA</ItemNumberType>
    </ItemNumberIdentification>
  </LIN>
  <QTY>
    <QuantityDetails>
      <QuantityQualifier>21</QuantityQualifier>
      <Quantity>${item.quantity}</Quantity>
      <MeasureUnitQualifier>${item.uom}</MeasureUnitQualifier>
    </QuantityDetails>
  </QTY>
  <PRI>
    <PriceInformation>
      <PriceQualifier>AAB</PriceQualifier>
      <Price>${item.unit_price}</Price>
      <PriceType>TU</PriceType>
    </PriceInformation>
  </PRI>`
    )
    .join('')}
  <UNT>
    <NumberOfSegments>${2 + order.items.length * 3}</NumberOfSegments>
    <MessageReferenceNumber>${order.order_number}</MessageReferenceNumber>
  </UNT>
</EDIFACT_ORDERS>`;
  }

  /**
   * Generate X12 850 (Purchase Order) XML
   */
  private generateX12XML(order: EDIOrder): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<X12_850>
  <ST>
    <TransactionSetIdentifierCode>850</TransactionSetIdentifierCode>
    <TransactionSetControlNumber>${
      order.order_number
    }</TransactionSetControlNumber>
  </ST>
  <BEG>
    <TransactionSetPurposeCode>00</TransactionSetPurposeCode>
    <PurchaseOrderTypeCode>NE</PurchaseOrderTypeCode>
    <PurchaseOrderNumber>${order.order_number}</PurchaseOrderNumber>
    <Date>${order.order_date.replace(/-/g, '')}</Date>
  </BEG>
  <N1_BY>
    <EntityIdentifierCode>BY</EntityIdentifierCode>
    <Name>${order.buyer_party.name}</Name>
    <IdentificationCodeQualifier>91</IdentificationCodeQualifier>
    <IdentificationCode>${order.buyer_party.gln}</IdentificationCode>
  </N1_BY>
  <N3_BY>
    <AddressInformation>${order.buyer_party.address}</AddressInformation>
  </N3_BY>
  <N4_BY>
    <CityName>${order.buyer_party.city}</CityName>
    <StateOrProvinceCode></StateOrProvinceCode>
    <PostalCode>${order.buyer_party.postal_code}</PostalCode>
    <CountryCode>${order.buyer_party.country}</CountryCode>
  </N4_BY>
  <N1_ST>
    <EntityIdentifierCode>ST</EntityIdentifierCode>
    <Name>${order.supplier_party.name}</Name>
    <IdentificationCodeQualifier>91</IdentificationCodeQualifier>
    <IdentificationCode>${order.supplier_party.gln}</IdentificationCode>
  </N1_ST>
  ${order.items
    .map(
      item => `
  <PO1>
    <AssignedIdentification>${item.line_number}</AssignedIdentification>
    <QuantityOrdered>${item.quantity}</QuantityOrdered>
    <UnitOrBasisForMeasurementCode>${item.uom}</UnitOrBasisForMeasurementCode>
    <UnitPrice>${item.unit_price}</UnitPrice>
    <BasisOfUnitPriceCode>PE</BasisOfUnitPriceCode>
    <ProductServiceIdQualifier>SK</ProductServiceIdQualifier>
    <ProductServiceId>${item.sku}</ProductServiceId>
  </PO1>`
    )
    .join('')}
  <CTT>
    <NumberOfLineItems>${order.items.length}</NumberOfLineItems>
  </CTT>
  <SE>
    <NumberOfIncludedSegments>${
      4 + order.items.length
    }</NumberOfIncludedSegments>
    <TransactionSetControlNumber>${
      order.order_number
    }</TransactionSetControlNumber>
  </SE>
</X12_850>`;
  }

  /**
   * Generate generic order XML for suppliers without specific EDI format
   */
  private generateGenericOrderXML(order: EDIOrder): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Order xmlns="http://www.remcura.nl/order/schema">
  <Header>
    <OrderNumber>${order.order_number}</OrderNumber>
    <OrderDate>${order.order_date}</OrderDate>
    <Currency>${order.currency}</Currency>
    <TotalAmount>${order.total_amount}</TotalAmount>
    ${
      order.delivery_date
        ? `<RequestedDeliveryDate>${order.delivery_date}</RequestedDeliveryDate>`
        : ''
    }
  </Header>
  <BuyerParty>
    <Name>${order.buyer_party.name}</Name>
    <GLN>${order.buyer_party.gln}</GLN>
    <Address>
      <Street>${order.buyer_party.address}</Street>
      <City>${order.buyer_party.city}</City>
      <PostalCode>${order.buyer_party.postal_code}</PostalCode>
      <Country>${order.buyer_party.country}</Country>
    </Address>
  </BuyerParty>
  <SupplierParty>
    <Name>${order.supplier_party.name}</Name>
    <PartnerID>${order.supplier_party.edi_partner_id}</PartnerID>
  </SupplierParty>
  <OrderLines>
    ${order.items
      .map(
        item => `
    <OrderLine>
      <LineNumber>${item.line_number}</LineNumber>
      <SKU>${item.sku}</SKU>
      <Description><![CDATA[${item.description || ''}]]></Description>
      <Quantity>${item.quantity}</Quantity>
      <UnitOfMeasure>${item.uom}</UnitOfMeasure>
      <UnitPrice>${item.unit_price}</UnitPrice>
      <LineTotal>${(item.quantity * item.unit_price).toFixed(2)}</LineTotal>
    </OrderLine>`
      )
      .join('')}
  </OrderLines>
  ${order.notes ? `<Notes><![CDATA[${order.notes}]]></Notes>` : ''}
</Order>`;
  }

  /**
   * Send XML to EDI endpoint
   */
  private async sendToEDIEndpoint(
    config: EDIConfig,
    xmlContent: string,
    orderReference: string
  ): Promise<{ success: boolean; error?: string; response?: any }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/xml',
        'X-Order-Reference': orderReference,
      };

      // Add authentication if configured
      if (config.edi_username && config.edi_password) {
        const auth = btoa(`${config.edi_username}:${config.edi_password}`);
        headers['Authorization'] = `Basic ${auth}`;
      }

      const response = await fetch(config.edi_endpoint, {
        method: 'POST',
        headers,
        body: xmlContent,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `EDI endpoint returned ${response.status}: ${responseText}`
        );
      }

      orderLogger.info(`EDI order ${orderReference} sent successfully`);

      return {
        success: true,
        response: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText,
        },
      };
    } catch (error: any) {
      orderLogger.error(`EDI sending failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Record order in supplier_orders table
   */
  private async recordSupplierOrder(
    order: SupplierOrder,
    orderReference: string,
    method: string,
    response: any
  ): Promise<void> {
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.total_price,
      0
    );
    const total = subtotal + (order.shipping_cost || 0);

    orderLogger.info('Supplier order recorded (simulation)', {
      supplier_id: order.supplier_id,
      order_reference: orderReference,
      method,
      success: response.success,
      subtotal,
      total,
    });
  }
}

export const ediService = new EDIService();
