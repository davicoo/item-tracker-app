export interface UserProfile {
  id: string
  name: string | null
  email: string
  bio: string | null
  shop_title: string | null
  shop_logo_url: string | null
  store_types?: string[] | null
  sku_options?: string[] | null
}
