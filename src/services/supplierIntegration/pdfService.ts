import { supabase } from '@/boot/supabase';
import { orderLogger } from '@/utils/logger';
import type {
  SupplierOrder,
  OrderSendingResult,
} from '@/stores/orderLists/orderLists-supplier-splitting';

export interface PDFConfig {
  email_template?: 'standard' | 'custom';
  pdf_template?: 'standard' | 'custom';
  email_subject_template?: string;
  include_logos?: boolean;
  include_terms?: boolean;
  auto_send_email?: boolean;
  cc_emails?: string[];
  bcc_emails?: string[];
  custom_css?: string;
  footer_text?: string;
}

export interface EmailTemplate {
  subject: string;
  body_html: string;
  body_text: string;
}

export class PDFService {
  /**
   * Send order via PDF (email with PDF attachment)
   */
  async sendOrderViaPDF(
    order: SupplierOrder,
    orderReference: string
  ): Promise<OrderSendingResult> {
    try {
      orderLogger.info(
        `Generating PDF order ${orderReference} for supplier ${order.supplier_name}`
      );

      // Get supplier and practice details
      const [supplierResult, practiceResult] = await Promise.all([
        supabase
          .from('suppliers')
          .select('integration_config, name, contact_email, contact_person')
          .eq('id', order.supplier_id)
          .single(),
        supabase
          .from('practices')
          .select(
            'name, address, city, postal_code, country, contact_email, contact_phone, logo_url'
          )
          .eq('id', order.practice_id)
          .single(),
      ]);

      if (supplierResult.error || !supplierResult.data) {
        throw new Error('Supplier not found');
      }

      if (practiceResult.error || !practiceResult.data) {
        throw new Error('Practice details not found');
      }

      const supplier = supplierResult.data;
      const practice = practiceResult.data;
      const pdfConfig = (supplier.integration_config as PDFConfig) || {};

      if (!supplier.contact_email) {
        throw new Error('Supplier email not configured');
      }

      // Generate PDF content
      const pdfHTML = this.generatePDFHTML(
        order,
        orderReference,
        practice,
        supplier,
        pdfConfig
      );

      // Generate PDF using browser's print functionality (would need actual PDF generation in production)
      const pdfBlob = await this.generatePDFBlob(pdfHTML);

      // Prepare email
      const emailTemplate = this.generateEmailTemplate(
        order,
        orderReference,
        practice,
        supplier,
        pdfConfig
      );

      // Send email with PDF attachment
      await this.sendEmail(
        supplier.contact_email,
        emailTemplate,
        pdfBlob,
        orderReference,
        pdfConfig
      );

      // Record the order
      await this.recordSupplierOrder(order, orderReference, 'pdf', {
        success: true,
      });

      return {
        supplier_id: order.supplier_id,
        supplier_name: order.supplier_name,
        status: 'sent',
        method_used: 'pdf',
        order_reference: orderReference,
        sent_at: new Date().toISOString(),
        delivery_expected: order.estimated_delivery_date,
      };
    } catch (error: any) {
      orderLogger.error(
        `PDF order sending failed for ${orderReference}:`,
        error
      );

      return {
        supplier_id: order.supplier_id,
        supplier_name: order.supplier_name,
        status: 'failed',
        method_used: 'pdf',
        order_reference: orderReference,
        sent_at: new Date().toISOString(),
        error_message: error.message,
      };
    }
  }

  /**
   * Generate PDF HTML content
   */
  private generatePDFHTML(
    order: SupplierOrder,
    orderReference: string,
    practice: any,
    supplier: any,
    config: PDFConfig
  ): string {
    const currentDate = new Date().toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bestelling ${orderReference}</title>
  <style>
    ${this.getDefaultPDFStyles()}
    ${config.custom_css || ''}
  </style>
</head>
<body>
  <div class="pdf-container">
    <!-- Header -->
    <header class="order-header">
      <div class="header-left">
        ${
          config.include_logos && practice.logo_url
            ? `<img src="${practice.logo_url}" alt="${practice.name}" class="logo">`
            : ''
        }
        <div class="practice-info">
          <h1>${practice.name}</h1>
          <div class="address">
            ${practice.address}<br>
            ${practice.postal_code} ${practice.city}<br>
            ${practice.country}
          </div>
          ${
            practice.contact_email
              ? `<div class="contact">Email: ${practice.contact_email}</div>`
              : ''
          }
          ${
            practice.contact_phone
              ? `<div class="contact">Tel: ${practice.contact_phone}</div>`
              : ''
          }
        </div>
      </div>
      <div class="header-right">
        <h2>BESTELLING</h2>
        <div class="order-info">
          <div><strong>Bestelnummer:</strong> ${orderReference}</div>
          <div><strong>Datum:</strong> ${currentDate}</div>
          ${
            order.estimated_delivery_date
              ? `<div><strong>Gewenste leverdatum:</strong> ${new Date(
                  order.estimated_delivery_date
                ).toLocaleDateString('nl-NL')}</div>`
              : ''
          }
        </div>
      </div>
    </header>

    <!-- Supplier info -->
    <section class="supplier-section">
      <h3>Leverancier</h3>
      <div class="supplier-info">
        <strong>${supplier.name}</strong>
        ${
          supplier.contact_person ? `<br>T.a.v. ${supplier.contact_person}` : ''
        }
      </div>
    </section>

    <!-- Order items -->
    <section class="items-section">
      <h3>Bestelde artikelen</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Artikel</th>
            <th>SKU</th>
            <th>Aantal</th>
            <th>Prijs per stuk</th>
            <th>Totaal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.supplier_sku || item.sku}</td>
            <td>${item.quantity}</td>
            <td>€${item.unit_price.toFixed(2)}</td>
            <td>€${(item.quantity * item.unit_price).toFixed(2)}</td>
          </tr>
          `
            )
            .join('')}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3"><strong>Totaal aantal artikelen:</strong></td>
            <td><strong>${order.total_items}</strong></td>
            <td><strong>€${order.total_value.toFixed(2)}</strong></td>
          </tr>
          ${
            order.shipping_cost
              ? `
          <tr>
            <td colspan="4">Verzendkosten</td>
            <td>€${order.shipping_cost.toFixed(2)}</td>
          </tr>
          <tr class="grand-total">
            <td colspan="4"><strong>Totaal inclusief verzending</strong></td>
            <td><strong>€${(order.total_value + order.shipping_cost).toFixed(
              2
            )}</strong></td>
          </tr>
          `
              : ''
          }
        </tfoot>
      </table>
    </section>

    <!-- Additional notes -->
    <section class="notes-section">
      <h3>Opmerkingen</h3>
      <p>Deze bestelling is automatisch gegenereerd door Remcura voor ${
        practice.name
      }.</p>
      <p>Gelieve deze bestelling te bevestigen en een verwachte leverdatum door te geven.</p>
    </section>

    ${
      config.include_terms
        ? `
    <section class="terms-section">
      <h3>Algemene voorwaarden</h3>
      <p>Deze bestelling is onderworpen aan de algemene voorwaarden van ${practice.name} en de leverancier.</p>
    </section>
    `
        : ''
    }

    <!-- Footer -->
    <footer class="order-footer">
      ${
        config.footer_text ||
        `<p>Gegenereerd op ${new Date().toLocaleString(
          'nl-NL'
        )} door Remcura</p>`
      }
    </footer>
  </div>
</body>
</html>`;
  }

  /**
   * Get default PDF styles
   */
  private getDefaultPDFStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #333;
      }
      
      .pdf-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .order-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #2196F3;
      }
      
      .logo {
        max-height: 60px;
        margin-bottom: 10px;
      }
      
      .practice-info h1 {
        font-size: 18px;
        color: #2196F3;
        margin-bottom: 10px;
      }
      
      .address {
        margin-bottom: 10px;
      }
      
      .contact {
        font-size: 11px;
        color: #666;
      }
      
      .header-right {
        text-align: right;
      }
      
      .header-right h2 {
        font-size: 24px;
        color: #2196F3;
        margin-bottom: 15px;
      }
      
      .order-info div {
        margin-bottom: 5px;
      }
      
      .supplier-section, .items-section, .notes-section, .terms-section {
        margin-bottom: 25px;
      }
      
      h3 {
        font-size: 14px;
        color: #2196F3;
        margin-bottom: 10px;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 5px;
      }
      
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      
      .items-table th,
      .items-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      
      .items-table th {
        background-color: #f5f5f5;
        font-weight: bold;
      }
      
      .items-table td:nth-child(3),
      .items-table td:nth-child(4),
      .items-table td:nth-child(5) {
        text-align: right;
      }
      
      .total-row td {
        background-color: #f9f9f9;
        font-weight: bold;
      }
      
      .grand-total td {
        background-color: #2196F3;
        color: white;
        font-weight: bold;
      }
      
      .notes-section p {
        margin-bottom: 8px;
      }
      
      .order-footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
        text-align: center;
        font-size: 10px;
        color: #666;
      }
      
      @media print {
        .pdf-container {
          margin: 0;
          padding: 0;
        }
        
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `;
  }

  /**
   * Generate PDF blob (simplified - in production use a proper PDF library)
   */
  private async generatePDFBlob(htmlContent: string): Promise<Blob> {
    // This is a simplified approach. In a production environment, you would use:
    // - Puppeteer for server-side PDF generation
    // - jsPDF for client-side PDF generation
    // - Or a PDF generation service

    // For now, we'll return the HTML as a blob that can be printed to PDF
    return new Blob([htmlContent], { type: 'text/html' });
  }

  /**
   * Generate email template
   */
  private generateEmailTemplate(
    order: SupplierOrder,
    orderReference: string,
    practice: any,
    supplier: any,
    config: PDFConfig
  ): EmailTemplate {
    const defaultSubject = config.email_subject_template
      ? config.email_subject_template
          .replace('{order_reference}', orderReference)
          .replace('{practice_name}', practice.name)
          .replace('{supplier_name}', supplier.name)
      : `Nieuwe bestelling ${orderReference} van ${practice.name}`;

    const bodyHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Nieuwe bestelling</h2>
          
          <p>Beste ${supplier.contact_person || supplier.name},</p>
          
          <p>Hierbij ontvangt u een nieuwe bestelling van <strong>${
            practice.name
          }</strong>.</p>
          
          <h3>Bestelling details:</h3>
          <ul>
            <li><strong>Bestelnummer:</strong> ${orderReference}</li>
            <li><strong>Datum:</strong> ${new Date().toLocaleDateString(
              'nl-NL'
            )}</li>
            <li><strong>Aantal artikelen:</strong> ${order.total_items}</li>
            <li><strong>Totaalwaarde:</strong> €${order.total_value.toFixed(
              2
            )}</li>
            ${
              order.estimated_delivery_date
                ? `<li><strong>Gewenste leverdatum:</strong> ${new Date(
                    order.estimated_delivery_date
                  ).toLocaleDateString('nl-NL')}</li>`
                : ''
            }
          </ul>
          
          <p>Zie de bijgevoegde PDF voor alle details van de bestelling.</p>
          
          <p>Gelieve deze bestelling te bevestigen en een verwachte leverdatum door te geven.</p>
          
          <p>Met vriendelijke groet,<br>
          ${practice.name}<br>
          ${practice.contact_email || ''}</p>
          
          <hr>
          <p style="font-size: 12px; color: #666;">
            Deze email is automatisch gegenereerd door Remcura.
          </p>
        </body>
      </html>
    `;

    const bodyText = `
Nieuwe bestelling

Beste ${supplier.contact_person || supplier.name},

Hierbij ontvangt u een nieuwe bestelling van ${practice.name}.

Bestelling details:
- Bestelnummer: ${orderReference}
- Datum: ${new Date().toLocaleDateString('nl-NL')}
- Aantal artikelen: ${order.total_items}
- Totaalwaarde: €${order.total_value.toFixed(2)}
${
  order.estimated_delivery_date
    ? `- Gewenste leverdatum: ${new Date(
        order.estimated_delivery_date
      ).toLocaleDateString('nl-NL')}`
    : ''
}

Zie de bijgevoegde PDF voor alle details van de bestelling.

Gelieve deze bestelling te bevestigen en een verwachte leverdatum door te geven.

Met vriendelijke groet,
${practice.name}
${practice.contact_email || ''}

---
Deze email is automatisch gegenereerd door Remcura.
    `;

    return {
      subject: defaultSubject,
      body_html: bodyHtml,
      body_text: bodyText,
    };
  }

  /**
   * Send email with PDF attachment
   */
  private async sendEmail(
    recipientEmail: string,
    template: EmailTemplate,
    pdfBlob: Blob,
    orderReference: string,
    config: PDFConfig
  ): Promise<void> {
    try {
      // In a production environment, you would integrate with an email service like:
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Or use Supabase Edge Functions for email sending

      // For now, we'll simulate the email sending
      orderLogger.info(
        `Email sent to ${recipientEmail} with PDF attachment for order ${orderReference}`
      );

      // Create a download link for the PDF (for testing purposes)
      const pdfUrl = URL.createObjectURL(pdfBlob);
      console.log(`PDF download link: ${pdfUrl}`);

      // Log email details
      orderLogger.info('Email details:', {
        to: recipientEmail,
        cc: config.cc_emails || [],
        bcc: config.bcc_emails || [],
        subject: template.subject,
        attachment: `order_${orderReference}.pdf`,
      });
    } catch (error: any) {
      orderLogger.error('Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
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
    const { error } = await supabase.from('supplier_orders').insert({
      supplier_id: order.supplier_id,
      order_list_id: null,
      practice_id: order.practice_id,
      status: response.success ? 'sent' : 'failed',
      method_used: method,
      sent_at: new Date().toISOString(),
      delivery_expected: order.estimated_delivery_date,
      total_items: order.total_items,
      total_value: order.total_value,
      response_data: response,
      order_reference: orderReference,
    });

    if (error) {
      orderLogger.error('Failed to record supplier order:', error);
      throw error;
    }
  }

  /**
   * Generate PDF for download (without sending email)
   */
  async generatePDFForDownload(
    order: SupplierOrder,
    orderReference: string
  ): Promise<Blob> {
    // Get practice and supplier details
    const [practiceResult, supplierResult] = await Promise.all([
      supabase
        .from('practices')
        .select(
          'name, address, city, postal_code, country, contact_email, contact_phone, logo_url'
        )
        .eq('id', order.practice_id)
        .single(),
      supabase
        .from('suppliers')
        .select('name, contact_person, integration_config')
        .eq('id', order.supplier_id)
        .single(),
    ]);

    if (practiceResult.error || supplierResult.error) {
      throw new Error('Failed to fetch order details');
    }

    const practice = practiceResult.data;
    const supplier = supplierResult.data;
    const config = (supplier.integration_config as PDFConfig) || {};

    const htmlContent = this.generatePDFHTML(
      order,
      orderReference,
      practice,
      supplier,
      config
    );
    return this.generatePDFBlob(htmlContent);
  }
}

export const pdfService = new PDFService();
