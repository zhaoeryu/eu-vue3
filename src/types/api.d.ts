export interface BaseEntity {
  createBy?: string;
  createByNickname?: string;
  createTime: string;
  updateBy?: string;
  updateByNickname?: string;
  updateTime?: string;
  remark?: string;
  delFlag: number;
}

export interface ResultBody<T = any> {
  code: number;
  msg: string;
  data: T;
  path?: string;
  timestamp?: number;
  [key: string]: any;
}

export interface PageResult<T = any> {
  records: T[];
  total: number;
}

export interface UploadResult {
  name: string;
  link: string;
  uri: string;
}
