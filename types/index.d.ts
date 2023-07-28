export type SiteConfig = {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
}

export interface Nameservice {
  address: string;
  name: string;
  authority: string;
  domain: string;
  refreshed_at?: Date;
  slot_created_at?: Date;
  slot_updated_at?: Date;
  created_at?: Date;
}

export interface Profile {
  address: string;
  screen_name: string;
  authority: string;
  metadata_uri: string;
  metadata: any;
  slot_created_at: number;
  slot_updated_at: number;
}

export interface Post {
  address: string;
  metadata: any;
  metadata_uri: string;
  profile: string;
  random_hash: number;
  reply_to?: string;
  refreshed_at?: Date;
  slot_created_at?: Date;
  slot_updated_at?: Date;
  created_at?: Date;
}