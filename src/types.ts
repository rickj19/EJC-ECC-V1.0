export type EventType = 'ejc' | 'ecc';
export type PersonType = 'jovem' | 'casal';

export interface BaseRegistration {
  id?: string;
  tipo_evento: EventType;
  tipo_pessoa: PersonType;
  foto_path: string;
  foto_url: string;
  criado_por?: string;
  created_at?: string;
}

export interface EJCRegistration extends BaseRegistration {
  tipo_evento: 'ejc';
  tipo_pessoa: 'jovem';
  nome: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  paroquia: string;
  cidade: string;
}

export interface ECCRegistration extends BaseRegistration {
  tipo_evento: 'ecc';
  tipo_pessoa: 'casal';
  nome_esposo: string;
  nome_esposa: string;
  telefone_casal: string;
  email_casal: string;
  tempo_casados: string;
  paroquia_casal: string;
  cidade_casal: string;
}

export type Registration = EJCRegistration | ECCRegistration;

export type PermissionType = 'admin_geral' | 'ejc' | 'ecc';

export interface Profile {
  id: string;
  user_id: string;
  nome: string;
  tipo_permissao: PermissionType;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
  email?: string; // Adicionado para facilitar a listagem
}

export type UserRole = 'ADMIN' | 'COORDINATOR_EJC' | 'COORDINATOR_ECC';

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
}
