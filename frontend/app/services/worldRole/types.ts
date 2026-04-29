export interface CreateRoleDto {
  name: string;
  permission_ids?: number[];
}

export interface UpdateRoleDto {
  name?: string;
  permission_ids?: number[];
}

export interface UserRoleEntry {
  role_id: number;
  role_name: string;
}
