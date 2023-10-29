declare global {
  interface Window {
    __upworkifyChangedTag?: string;
    filters: TFilters;
  }
  // TODO: Get types from `web-ext-types`?
  // var browser: any;
}
export default global;
