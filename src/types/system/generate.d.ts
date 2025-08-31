export interface GenerateTable {
  id: number | null;
  packageName: string | null;
  moduleName: string | null;
  funcGroup: string | null;
  author: string | null;
  tableComment: string | null;
  tableName: string;
  delShowField: string | null;
  genMode: number | null;
  detailHeaderFieldKey: string | null;
  crudEditMode: string | null;
  i18nEnable: number | null;
  createBy: string | null;
  createTime: string | null;
  updateBy: string | null;
  updateTime: string | null;
}

export interface GenerateColumn {
  id: number | null;
  tableName: string;
  columnName: string;
  columnComment: string | null;
  finalColumnComment: string | null;
  columnKey: string | null;
  columnType: string | null;
  autoPk: boolean | null;
  columnSort: number | null;
  notNull: boolean | null;
  javaType: string | null;
  javaField: string | null;
  tableShowField: string | null;
  columnLength: number | null;
  excelExport: boolean | null;
  tableShow: boolean | null;
  formShow: boolean | null;
  formType: number | null;
  jsType: number | null;
  queryType: number | null;
  dictKey: string | null;
  areaQuery: boolean | null;
  tableHeaderQuery: boolean | null;
  defaultVisible: boolean | null;
  enumKey: string | null;
  builtInFormType: boolean | null;
  createBy: string | null;
  createTime: string | null;
  updateBy: string | null;
  updateTime: string | null;

  _sort?: string;
  _sort_visible?: boolean;
}

export interface GeneratePreview {
  path: string;
  name: string;
  type: string;
  code: string;
  mode: string;
  i18n: boolean;
}

export interface GeneratePreviewTree {
  name: string;
  type: string;
  code: string;
  children: GeneratePreviewTree[];
}
