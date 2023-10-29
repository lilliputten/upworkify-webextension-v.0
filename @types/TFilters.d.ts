interface TFilters extends browser.storage.StorageObject {
  /** Show selected countries */
  showCountries: boolean;
  /** Hours number. 0 - disabled.  */
  showRecents: number | '';
  /** DEBUG */
  __changed?: string;
}
