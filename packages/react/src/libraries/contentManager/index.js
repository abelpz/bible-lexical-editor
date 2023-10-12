import Epitelete from "epitelete-html";

/**
 * A class with useful methods for managing
 * multiple intances of epitelete, each epitelete instance
 * can hold one Bible version (docSet), so this store allows
 * managing multiple Bible versions. Each Bible Version
 * is identified by a docSetId
 */
class BibleStore {
  constructor() {
    this.store = new Map();
  }

  /** creates a new Epitelete instance given a docsetId
   * and params for Epitelete's constructor
   */
  create(epiteleteParams) {
    this.store.set(epiteleteParams.docSetId, new Epitelete(epiteleteParams));
  }

  /** adds an Epitelete instance to the store
   * @param { Epitelete } epiteleteInstance
   */
  add(epiteleteInstance) {
    const docSetId = epiteleteInstance?.docSetId;
    if (docSetId) this.store.set(docSetId, epiteleteInstance);
  }

  /** removes a Epitelete instance from the store
   * @param {string} docSetId
   */
  remove(docSetId) {
    this.store.delete(docSetId);
  }

  /** gets an Epitelete instance given a docsetId
   * @param {string} docSetId
   */
  get(docSetId) {
    this.store.get(docSetId);
  }
}

export default BibleStore;
