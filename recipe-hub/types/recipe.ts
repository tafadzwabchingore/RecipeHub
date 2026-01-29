export interface Recipe {
  id: number
  user_id: string
  title: string
  slug: string
  description: string
  image_url?: string
  is_public: boolean
  created_at?: string
  updated_at?: string
}
