/* eslint-disable no-underscore-dangle */
const request = require('request-promise-native');
const useragentFromSeed = require('useragent-from-seed');

const baseUrl = 'https://studio.cucumber.io/api';

/**
 *
 *
 * @class CucumberStudio
 */
class CucumberStudio {
  constructor(
    { TOKEN, CLIENT, UID, projectId },
    { requestOptions, proxy } = {},
  ) {
    this.token = TOKEN;
    this.client = CLIENT;
    this.uid = UID;
    this.projectId = projectId || '';

    const userAgent = useragentFromSeed(TOKEN);

    const _requestOptions = requestOptions || {};

    _requestOptions.baseUrl = baseUrl;
    _requestOptions.uri = '';
    _requestOptions.headers = {
      'User-Agent': userAgent,
      Accept: 'application/vnd.api+json; version=1',
      'access-token': TOKEN,
      CLIENT,
      UID,
      Referer: baseUrl,
    };
    _requestOptions.proxy = proxy;
    _requestOptions.json = true;
    this.request = request.defaults(_requestOptions);
  }

  /**
   *
   * @async
   * @returns {Array} with all projects objects
   * @memberof CucumberStudio
   */
  async getAllProjects() {
    return this.request('/projects').then(data => data.data);
  }

  /**
   *
   * @async
   * @param {*} [projectId=this.projectId]
   * @returns {Object} project object
   * @memberof CucumberStudio
   */
  async getProjectById(projectId = this.projectId) {
    return this.request(`/projects/${projectId}`).then(data => data.data);
  }

  /**
   *
   * @async
   * @param {String} name project name
   * @returns {number}  project id
   * @memberof CucumberStudio
   */
  async getProjectIdByName(name) {
    let foundId = false;

    const allProjects = await this.request('/projects').then(data => data.data);

    for (let i = 0; i < allProjects.length; i + 1) {
      const project = allProjects[i];
      if (project.attributes.name === name) {
        foundId = project.id;
        break;
      }
    }
    return foundId;
  }

  /**
   *
   * @async
   * @param {*} [projectId=this.projectId]
   * @returns {Object} backup
   * @memberof CucumberStudio
   */
  async getProjectBackupById(projectId = this.projectId) {
    return this.request(`/projects/${projectId}/backups`).then(
      data => data.data,
    );
  }

  /**
   *
   * @async
   * @param [projectId=this.projectId]
   * @returns {Arrays} scenarios
   * @memberof CucumberStudio
   */
  async getScenarios(projectId = this.projectId) {
    return this.request(`/projects/${projectId}/scenarios`).then(
      data => data.data,
    );
  }

  /**
   *
   * @async
   * @param {*} [projectId=this.projectId]
   * @returns {Array} folders' objects
   * @memberof CucumberStudio
   */
  async getFolders(projectId = this.projectId) {
    return this.request(`/projects/${projectId}/folders`).then(
      data => data.data,
    );
  }

  /**
   *
   *
   * @param {*} [projectId=this.projectId]
   * @param {*} scenarioAttributesObject
   * @returns
   * @memberof CucumberStudio
   */
  async createScenario(projectId = this.projectId, scenarioAttributesObject) {
    if (!scenarioAttributesObject.name) throw new Error(`no 'name' attribute`);

    const body = {
      data: {
        attributes: scenarioAttributesObject,
      },
    };
    return this.request
      .post(`/projects/${projectId}/scenarios`, { body })
      .then(data => data.data);
  }

  /**
   *
   * @async
   * @param {*} projectId
   * @param {*} scenarioId
   * @param {Object} newAttributesObject
   * @returns {Object} updated scenario
   * @memberof CucumberStudio
   */
  async updateScenario(projectId, scenarioId, newAttributesObject) {
    const body = {
      data: {
        type: 'scenarios',
        id: scenarioId,
        attributes: newAttributesObject,
      },
    };
    return this.request
      .patch(`/projects/${projectId}/scenarios/${scenarioId}`, { body })
      .then(data => data.data);
  }

  /**
   *
   * @async
   * @param {*} projectId
   * @param {*} scenarioId
   * @returns
   * @memberof CucumberStudio
   */
  async deleteScenario(projectId, scenarioId) {
    return this.request
      .delete(`/projects/${projectId}/scenarios/${scenarioId}`)
      .then(data => data);
  }

  /**
   *
   * @async
   * @param {*} [projectId=this.projectId]
   * @param {*} folderAttributesObject
   * @returns {Object} created folder
   * @memberof CucumberStudio
   */
  async createFolder(projectId = this.projectId, folderAttributesObject) {
    if (!folderAttributesObject.name) throw new Error(`no 'name' attribute`);

    const body = {
      data: {
        attributes: folderAttributesObject,
      },
    };

    return this.request
      .post(`/projects/${projectId}/folders`, {
        body,
      })
      .then(data => data.data);
  }

  /**
   *
   * @async
   * @param {*} projectId
   * @param {*} folderId
   * @param {*} newAttributesObject
   * @returns {Object} updated folder
   * @memberof CucumberStudio
   */
  async updateFolder(projectId, folderId, newAttributesObject) {
    const body = {
      data: {
        type: 'folders',
        id: folderId,
        attributes: newAttributesObject,
      },
    };
    return this.request
      .patch(`/projects/${projectId}/folders/${folderId}`, { body })
      .then(data => data.data);
  }

  /**
   *
   * @async
   * @param {*} projectId
   * @param {*} folderId
   * @returns {Object} empty folder
   * @memberof CucumberStudio
   */
  async deleteFolder(projectId, folderId) {
    return this.request
      .delete(`/projects/${projectId}/folders/${folderId}`)
      .then(data => data);
  }

  /**
   *
   * @async
   * @param {number} folderId
   * @returns {Array} children folders
   * @memberof CucumberStudio
   */
  async getChildrenFolders(projectId, folderId) {
    return this.request(
      `/projects/${projectId}/folders/${folderId}/children`,
    ).then(data => data);
  }

  /**
   *
   * @async
   * @param {*} folderId
   * @returns {Array} empty folder
   * @memberof CucumberStudio
   */
  async deleteChildrenFolders(folderId) {
    return this.request
      .delete(`/projects/${this.projectId}/folders/${folderId}/children`)
      .then(data => data.data);
  }

  /**
   *
   * @async
   * @param {*} projectId
   * @param {*} folderId
   * @returns {Array} folder's scenaros
   * @memberof CucumberStudio
   */
  async getFolderScenarios(projectId, folderId) {
    return this.request(
      `/projects/${projectId}/folders/${folderId}/scenarios`,
    ).then(data => data.data);
  }

  /**
   *
   * @async
   * @param {*} folderId
   * @returns {Object} empty array
   * @memberof CucumberStudio
   */
  async clearAllScenarios(folderId) {
    return this.request
      .delete(`/projects/${this.projectId}/folders/${folderId}/scenarios`)
      .then(data => data.data);
  }
}

module.exports = CucumberStudio;
