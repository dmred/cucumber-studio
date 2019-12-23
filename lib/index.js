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
   * @returns {Object []} with all projects objects
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
    return this.request(`/projects/${projectId}/backups/last`).then(
      data => data,
    );
  }

  /**
   *
   * @async
   * @param [projectId=this.projectId]
   * @returns {Object []} scenarios
   * @memberof CucumberStudio
   */
  async getScenarios(projectId = this.projectId) {
    return this.request(`/projects/${projectId}/scenarios`).then(
      data => data.data,
    );
  }

  /**
   *
   *
   * @param {*} [projectId=this.projectId]
   * @returns {Object []} folders' objects
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
   * @param {Object} { projectId = this.projectId, scenarioAttributes }
   * @returns
   * @memberof CucumberStudio
   */
  async createScenario({ projectId = this.projectId, scenarioAttributes }) {
    if (!scenarioAttributes.name) throw new Error(`no 'name' attribute`);

    const body = {
      data: {
        attributes: scenarioAttributes,
      },
    };
    return this.request
      .post(`/projects/${projectId}/scenarios`, { body })
      .then(data => data.data);
  }

  /**
   *
   *
   * @param {Object} {
   *     projectId = this.projectId,
   *     scenarioId,
   *     newAttributes,
   *   }
   * @returns
   * @memberof CucumberStudio
   */
  async updateScenario({
    projectId = this.projectId,
    scenarioId,
    newAttributes,
  }) {
    const body = {
      data: {
        type: 'scenarios',
        id: scenarioId,
        attributes: newAttributes,
      },
    };
    return this.request
      .patch(`/projects/${projectId}/scenarios/${scenarioId}`, { body })
      .then(data => data.data);
  }

  /**
   *
   *
   * @param {Object} { projectId = this.projectId, scenarioId }
   * @returns
   * @memberof CucumberStudio
   */
  async deleteScenario({ projectId = this.projectId, scenarioId }) {
    return this.request
      .delete(`/projects/${projectId}/scenarios/${scenarioId}`)
      .then(data => data);
  }

  _setProjectId(projectId) {
    this.projectId = projectId;
  }

  /**
   *
   *
   * @param {Object} { projectId = this.projectId, folderAttributes }
   * @returns
   * @memberof CucumberStudio
   */
  async createFolder({ projectId = this.projectId, folderAttributes }) {
    if (!folderAttributes.name) throw new Error(`no 'name' attribute`);

    const body = {
      data: {
        attributes: folderAttributes,
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
   *
   * @param {Object} { projectId = this.projectId, folderId, newAttributes }
   * @returns
   * @memberof CucumberStudio
   */
  async updateFolder({ projectId = this.projectId, folderId, newAttributes }) {
    const body = {
      data: {
        type: 'folders',
        id: folderId,
        attributes: newAttributes,
      },
    };
    return this.request
      .patch(`/projects/${projectId}/folders/${folderId}`, { body })
      .then(data => data.data);
  }

  /**
   *
   *
   * @param {Object} { projectId = this.projectId, folderId }
   * @returns
   * @memberof CucumberStudio
   */
  async deleteFolder({ projectId = this.projectId, folderId }) {
    return this.request
      .delete(`/projects/${projectId}/folders/${folderId}`)
      .then(data => data);
  }

  /**
   *
   *
   * @param {Object} { projectId = this.projectId, folderId }
   * @returns
   * @memberof CucumberStudio
   */
  async getChildrenFolders({ projectId = this.projectId, folderId }) {
    return this.request(
      `/projects/${projectId}/folders/${folderId}/children`,
    ).then(data => data);
  }

  /**
   *
   *
   * @param {Object} { projectId = this.projectId, folderId }
   * @returns
   * @memberof CucumberStudio
   */
  async deleteChildrenFolders({ projectId = this.projectId, folderId }) {
    return this.request
      .delete(`/projects/${projectId}/folders/${folderId}/children`)
      .then(data => data);
  }

  /**
   *
   *
   * @param {Object} { projectId = this.projectId, folderId }
   * @returns
   * @memberof CucumberStudio
   */
  async getFolderScenarios({ projectId = this.projectId, folderId }) {
    return this.request(
      `/projects/${projectId}/folders/${folderId}/scenarios`,
    ).then(data => data.data);
  }

  /**
   *
   *
   * @param {Object} { projectId = this.projectId, folderId }
   * @returns
   * @memberof CucumberStudio
   */
  async clearAllScenarios({ projectId = this.projectId, folderId }) {
    return this.request
      .delete(`/projects/${projectId}/folders/${folderId}/scenarios`)
      .then(data => data);
  }
}

module.exports = CucumberStudio;
