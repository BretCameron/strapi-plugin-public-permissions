import type { Core } from "@strapi/strapi";

type Connection = Core.Strapi["db"]["connection"]["transaction"];

export type Transaction = Parameters<Parameters<Connection>[0]>[0];

export interface UPRole {
  id: number;
  name: string | null;
  description: string | null;
  type: string | null;
  created_at: number | null;
  update_at: number | null;
  created_by_id: number | null;
  updated_by_id: number | null;
}

export interface UPPermission {
  id: number;
  action: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by_id: string | null;
  updated_by_id: string | null;
}

export interface UPPermissionsLink {
  id: number;
  permission_id: number | null;
  role_id: number | null;
  permission_order: number | null;
}
