# Inventory Schema Reference

## counting_entries

| column_name         | data_type                | is_nullable | column_default            |
| ------------------- | ------------------------ | ----------- | ------------------------- |
| id                  | uuid                     | NO          | gen_random_uuid()         |
| counting_session_id | uuid                     | NO          |                           |
| practice_id         | uuid                     | NO          |                           |
| location_id         | uuid                     | NO          |                           |
| product_id          | uuid                     | NO          |                           |
| system_quantity     | numeric                  | NO          |                           |
| counted_quantity    | numeric                  | NO          |                           |
| variance_quantity   | numeric                  | YES         |                           |
| batch_number        | character varying        | YES         |                           |
| expiry_date         | date                     | YES         |                           |
| notes               | text                     | YES         |                           |
| confidence_level    | character varying        | YES         | 'high'::character varying |
| counted_by          | uuid                     | YES         |                           |
| counted_at          | timestamp with time zone | YES         | now()                     |
| verified_by         | uuid                     | YES         |                           |
| verified_at         | timestamp with time zone | YES         |                           |
| created_at          | timestamp with time zone | YES         | now()                     |
| updated_at          | timestamp with time zone | YES         | now()                     |

## counting_sessions

| column_name             | data_type                | is_nullable | column_default                   |
| ----------------------- | ------------------------ | ----------- | -------------------------------- |
| id                      | uuid                     | NO          | gen_random_uuid()                |
| practice_id             | uuid                     | NO          |                                  |
| location_id             | uuid                     | NO          |                                  |
| name                    | character varying        | NO          |                                  |
| description             | text                     | YES         |                                  |
| status                  | USER-DEFINED             | YES         | 'draft'::counting_session_status |
| count_all_products      | boolean                  | YES         | true                             |
| product_category_filter | character varying        | YES         |                                  |
| specific_product_ids    | ARRAY                    | YES         |                                  |
| started_at              | timestamp with time zone | YES         |                                  |
| completed_at            | timestamp with time zone | YES         |                                  |
| approved_at             | timestamp with time zone | YES         |                                  |
| total_products_counted  | integer                  | YES         | 0                                |
| products_with_variance  | integer                  | YES         | 0                                |
| total_variance_value    | numeric                  | YES         | 0                                |
| created_by              | uuid                     | YES         |                                  |
| started_by              | uuid                     | YES         |                                  |
| completed_by            | uuid                     | YES         |                                  |
| approved_by             | uuid                     | YES         |                                  |
| created_at              | timestamp with time zone | YES         | now()                            |
| updated_at              | timestamp with time zone | YES         | now()                            |

## order_list_items

| column_name           | data_type                | is_nullable | column_default               |
| --------------------- | ------------------------ | ----------- | ---------------------------- |
| id                    | uuid                     | NO          | gen_random_uuid()            |
| order_list_id         | uuid                     | NO          |                              |
| product_id            | uuid                     | NO          |                              |
| supplier_product_id   | uuid                     | YES         |                              |
| suggested_quantity    | numeric                  | NO          |                              |
| ordered_quantity      | numeric                  | YES         |                              |
| received_quantity     | numeric                  | YES         | 0                            |
| unit_price            | numeric                  | YES         |                              |
| total_price           | numeric                  | YES         |                              |
| status                | character varying        | YES         | 'pending'::character varying |
| notes                 | text                     | YES         |                              |
| created_at            | timestamp with time zone | YES         | now()                        |
| minimum_stock         | numeric                  | YES         | 0                            |
| maximum_stock         | numeric                  | YES         | 100                          |
| current_stock         | numeric                  | YES         | 0                            |
| reorder_point         | numeric                  | YES         |                              |
| preferred_supplier_id | uuid                     | YES         |                              |
| alternative_suppliers | ARRAY                    | YES         | '{}'::uuid[]                 |
| last_order_date       | timestamp with time zone | YES         |                              |
| last_order_quantity   | numeric                  | YES         |                              |
| average_consumption   | numeric                  | YES         | 0                            |
| lead_time_days        | integer                  | YES         | 7                            |
| urgency_level         | character varying        | YES         | 'normal'::character varying  |
| auto_suggest_enabled  | boolean                  | YES         | true                         |
| manual_override       | boolean                  | YES         | false                        |
| override_reason       | text                     | YES         |                              |

## order_lists

| column_name            | data_type                | is_nullable | column_default                    |
| ---------------------- | ------------------------ | ----------- | --------------------------------- |
| id                     | uuid                     | NO          | gen_random_uuid()                 |
| practice_id            | uuid                     | NO          |                                   |
| location_id            | uuid                     | NO          |                                   |
| supplier_id            | uuid                     | YES         |                                   |
| name                   | character varying        | NO          |                                   |
| description            | text                     | YES         |                                   |
| status                 | USER-DEFINED             | YES         | 'draft'::order_list_status        |
| total_items            | integer                  | YES         | 0                                 |
| total_value            | numeric                  | YES         | 0                                 |
| created_by             | uuid                     | YES         |                                   |
| created_at             | timestamp with time zone | YES         | now()                             |
| updated_at             | timestamp with time zone | YES         | now()                             |
| list_type              | character varying        | YES         | 'reorder_list'::character varying |
| auto_reorder_enabled   | boolean                  | YES         | false                             |
| reorder_frequency_days | integer                  | YES         | 14                                |
| last_auto_check        | timestamp with time zone | YES         |                                   |
| min_order_value        | numeric                  | YES         | 0                                 |
| preferred_order_day    | integer                  | YES         |                                   |
| order_cutoff_time      | time without time zone   | YES         |                                   |
| tags                   | ARRAY                    | YES         | '{}'::text[]                      |
| is_template            | boolean                  | YES         | false                             |
| template_name          | character varying        | YES         |                                   |

## practice_locations

| column_name           | data_type                | is_nullable | column_default               |
| --------------------- | ------------------------ | ----------- | ---------------------------- |
| id                    | uuid                     | NO          | gen_random_uuid()            |
| practice_id           | uuid                     | NO          |                              |
| name                  | character varying        | NO          |                              |
| code                  | character varying        | NO          |                              |
| description           | text                     | YES         |                              |
| location_type         | character varying        | YES         | 'storage'::character varying |
| address               | text                     | YES         |                              |
| floor_level           | character varying        | YES         |                              |
| room_number           | character varying        | YES         |                              |
| is_active             | boolean                  | YES         | true                         |
| is_main_location      | boolean                  | YES         | false                        |
| requires_counting     | boolean                  | YES         | true                         |
| allows_negative_stock | boolean                  | YES         | false                        |
| restricted_access     | boolean                  | YES         | false                        |
| access_code           | character varying        | YES         |                              |
| responsible_user_id   | uuid                     | YES         |                              |
| created_at            | timestamp with time zone | YES         | now()                        |
| updated_at            | timestamp with time zone | YES         | now()                        |
| created_by            | uuid                     | YES         |                              |
| updated_by            | uuid                     | YES         |                              |

## practice_members

| column_name | data_type                | is_nullable | column_default     |
| ----------- | ------------------------ | ----------- | ------------------ |
| id          | uuid                     | NO          | uuid_generate_v4() |
| practice_id | uuid                     | NO          |                    |
| user_id     | uuid                     | NO          |                    |
| role        | USER-DEFINED             | NO          | 'guest'::user_role |
| joined_at   | timestamp with time zone | YES         | now()              |
| invited_by  | uuid                     | YES         |                    |
| created_at  | timestamp with time zone | YES         | now()              |
| updated_at  | timestamp with time zone | YES         | now()              |

## product_batches

| column_name           | data_type                | is_nullable | column_default              |
| --------------------- | ------------------------ | ----------- | --------------------------- |
| id                    | uuid                     | NO          | gen_random_uuid()           |
| practice_id           | uuid                     | NO          |                             |
| product_id            | uuid                     | NO          |                             |
| location_id           | uuid                     | NO          |                             |
| batch_number          | character varying        | NO          |                             |
| supplier_batch_number | character varying        | YES         |                             |
| expiry_date           | date                     | NO          |                             |
| received_date         | date                     | NO          | CURRENT_DATE                |
| initial_quantity      | numeric                  | NO          |                             |
| current_quantity      | numeric                  | NO          |                             |
| reserved_quantity     | numeric                  | YES         | 0                           |
| available_quantity    | numeric                  | YES         |                             |
| unit_cost             | numeric                  | YES         |                             |
| total_cost            | numeric                  | YES         |                             |
| currency              | character varying        | YES         | 'EUR'::character varying    |
| supplier_id           | uuid                     | YES         |                             |
| purchase_order_number | character varying        | YES         |                             |
| invoice_number        | character varying        | YES         |                             |
| status                | character varying        | YES         | 'active'::character varying |
| quality_check_passed  | boolean                  | YES         | true                        |
| quality_notes         | text                     | YES         |                             |
| quarantine_until      | date                     | YES         |                             |
| created_at            | timestamp with time zone | YES         | now()                       |
| updated_at            | timestamp with time zone | YES         | now()                       |
| created_by            | uuid                     | YES         |                             |

## products

| column_name              | data_type                | is_nullable | column_default     |
| ------------------------ | ------------------------ | ----------- | ------------------ |
| id                       | uuid                     | NO          | uuid_generate_v4() |
| magento_id               | integer                  | YES         |                    |
| sku                      | character varying        | NO          |                    |
| name                     | character varying        | NO          |                    |
| category                 | character varying        | YES         |                    |
| subcategory              | character varying        | YES         |                    |
| brand                    | character varying        | YES         |                    |
| description              | text                     | YES         |                    |
| image_url                | text                     | YES         |                    |
| price                    | numeric                  | YES         |                    |
| unit                     | character varying        | YES         |                    |
| active                   | boolean                  | YES         | true               |
| last_synced_at           | timestamp with time zone | YES         | now()              |
| created_at               | timestamp with time zone | YES         | now()              |
| updated_at               | timestamp with time zone | YES         | now()              |
| preferred_supplier_id    | uuid                     | YES         |                    |
| requires_batch_tracking  | boolean                  | NO          | false              |
| barcode                  | character varying        | YES         |                    |
| gtin                     | character varying        | YES         |                    |
| gpc_brick_code           | character varying        | YES         |                    |
| gln_manufacturer         | character varying        | YES         |                    |
| net_content_value        | numeric                  | YES         |                    |
| net_content_uom          | character varying        | YES         |                    |
| gross_weight             | numeric                  | YES         |                    |
| net_weight               | numeric                  | YES         |                    |
| base_unit_indicator      | boolean                  | YES         | true               |
| orderable_unit_indicator | boolean                  | YES         | true               |
| despatch_unit_indicator  | boolean                  | YES         | true               |
| country_of_origin        | character varying        | YES         |                    |
| effective_from_date      | date                     | YES         |                    |
| effective_to_date        | date                     | YES         |                    |
| product_lifecycle_status | character varying        | YES         |                    |

## stock_levels

| column_name           | data_type                | is_nullable | column_default    |
| --------------------- | ------------------------ | ----------- | ----------------- |
| id                    | uuid                     | NO          | gen_random_uuid() |
| practice_id           | uuid                     | NO          |                   |
| location_id           | uuid                     | NO          |                   |
| product_id            | uuid                     | NO          |                   |
| current_quantity      | numeric                  | YES         | 0                 |
| reserved_quantity     | numeric                  | YES         | 0                 |
| available_quantity    | numeric                  | YES         |                   |
| minimum_quantity      | numeric                  | YES         | 0                 |
| maximum_quantity      | numeric                  | YES         |                   |
| reorder_point         | numeric                  | YES         |                   |
| preferred_supplier_id | uuid                     | YES         |                   |
| last_counted_at       | timestamp with time zone | YES         |                   |
| last_movement_at      | timestamp with time zone | YES         |                   |
| last_ordered_at       | timestamp with time zone | YES         |                   |
| created_at            | timestamp with time zone | YES         | now()             |
| updated_at            | timestamp with time zone | YES         | now()             |

## stock_movements

| column_name     | data_type                | is_nullable | column_default    |
| --------------- | ------------------------ | ----------- | ----------------- |
| id              | uuid                     | NO          | gen_random_uuid() |
| practice_id     | uuid                     | NO          |                   |
| location_id     | uuid                     | NO          |                   |
| product_id      | uuid                     | NO          |                   |
| movement_type   | character varying        | NO          |                   |
| quantity_change | numeric                  | NO          |                   |
| quantity_before | numeric                  | NO          |                   |
| quantity_after  | numeric                  | NO          |                   |
| reference_type  | character varying        | YES         |                   |
| reference_id    | uuid                     | YES         |                   |
| reason          | character varying        | YES         |                   |
| notes           | text                     | YES         |                   |
| batch_number    | character varying        | YES         |                   |
| expiry_date     | date                     | YES         |                   |
| created_by      | uuid                     | YES         |                   |
| created_at      | timestamp with time zone | YES         | now()             |
| batch_id        | uuid                     | YES         |                   |

## supplier_products

| column_name            | data_type                | is_nullable | column_default           |
| ---------------------- | ------------------------ | ----------- | ------------------------ |
| id                     | uuid                     | NO          | gen_random_uuid()        |
| supplier_id            | uuid                     | NO          |                          |
| product_id             | uuid                     | NO          |                          |
| supplier_sku           | character varying        | NO          |                          |
| supplier_name          | character varying        | YES         |                          |
| cost_price             | numeric                  | YES         |                          |
| list_price             | numeric                  | YES         |                          |
| currency               | character varying        | YES         | 'EUR'::character varying |
| minimum_order_quantity | integer                  | YES         | 1                        |
| order_multiple         | integer                  | YES         | 1                        |
| lead_time_days         | integer                  | YES         |                          |
| is_available           | boolean                  | YES         | true                     |
| is_preferred           | boolean                  | YES         | false                    |
| created_at             | timestamp with time zone | YES         | now()                    |
| updated_at             | timestamp with time zone | YES         | now()                    |
| gtin                   | character varying        | YES         |                          |
| last_synced_at         | timestamp with time zone | YES         |                          |

## suppliers

| column_name             | data_type                | is_nullable | column_default                   |
| ----------------------- | ------------------------ | ----------- | -------------------------------- |
| id                      | uuid                     | NO          | gen_random_uuid()                |
| name                    | character varying        | NO          |                                  |
| code                    | character varying        | NO          |                                  |
| contact_email           | character varying        | YES         |                                  |
| contact_phone           | character varying        | YES         |                                  |
| contact_person          | character varying        | YES         |                                  |
| address                 | text                     | YES         |                                  |
| city                    | character varying        | YES         |                                  |
| postal_code             | character varying        | YES         |                                  |
| country                 | character varying        | YES         | 'Netherlands'::character varying |
| website                 | character varying        | YES         |                                  |
| vat_number              | character varying        | YES         |                                  |
| business_registration   | character varying        | YES         |                                  |
| payment_terms           | integer                  | YES         | 30                               |
| minimum_order_amount    | numeric                  | YES         | 0                                |
| shipping_cost           | numeric                  | YES         | 0                                |
| free_shipping_threshold | numeric                  | YES         |                                  |
| api_endpoint            | character varying        | YES         |                                  |
| api_key_encrypted       | text                     | YES         |                                  |
| api_type                | character varying        | YES         |                                  |
| sync_enabled            | boolean                  | YES         | false                            |
| last_sync_at            | timestamp with time zone | YES         |                                  |
| notes                   | text                     | YES         |                                  |
| is_active               | boolean                  | YES         | true                             |
| preferred_order_day     | integer                  | YES         |                                  |
| order_cutoff_time       | time without time zone   | YES         |                                  |
| created_at              | timestamp with time zone | YES         | now()                            |
| updated_at              | timestamp with time zone | YES         | now()                            |
| created_by              | uuid                     | YES         |                                  |
| updated_by              | uuid                     | YES         |                                  |
| integration_type        | character varying        | YES         | 'manual'::character varying      |
| order_method            | character varying        | YES         | 'manual'::character varying      |
| integration_config      | jsonb                    | YES         | '{}'::jsonb                      |
| auto_sync_enabled       | boolean                  | YES         | false                            |
