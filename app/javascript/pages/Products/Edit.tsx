import { usePage } from "@inertiajs/react";
import React from "react";

import ProductEditPage from "$app/components/server-components/ProductEditPage";

// Props type matching ProductPresenter#edit_props
interface ProductEditPageProps {
  product: any; // Complex product type from ProductEditPage
  id: string;
  unique_permalink: string;
  thumbnail: any;
  refund_policies: any[];
  currency_type: string;
  is_tiered_membership: boolean;
  is_listed_on_discover: boolean;
  is_physical: boolean;
  profile_sections: any[];
  taxonomies: any[];
  earliest_membership_price_change_date: string;
  custom_domain_verification_status: { success: boolean; message: string } | null;
  sales_count_for_inventory: number;
  successful_sales_count: number;
  ratings: any;
  seller: any;
  existing_files: any[];
  aws_key: string;
  s3_url: string;
  available_countries: any[];
  google_client_id: string;
  google_calendar_enabled: boolean;
  seller_refund_policy_enabled: boolean;
  seller_refund_policy: any;
  cancellation_discounts_enabled: boolean;
}

function Edit() {
  const props = usePage<ProductEditPageProps>().props;

  return <ProductEditPage {...props} />;
}

export default Edit;
