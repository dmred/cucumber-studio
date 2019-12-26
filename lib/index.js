/* eslint-disable no-underscore-dangle */
const request = require('request-promise-native');
const useragentFromSeed = require('useragent-from-seed');

const baseUrl = 'https://studio.cucumber.io/api';

/**
 * Creates an instance of CucumberStudio.
 * @class CucumberStudio
 *
 * @example
 * // returns instace of CucumberStudio
 * const cucumberStudio = new CucumberStudio({TOKEN, CLIENT, UID});
 * @example
 *
 * @param {Object} credentials
 * @param {string} credentials.TOKEN
 * @param {string} credentials.CLIENT
 * @param {string} credentials.UID
 * @param {string} [credentials.projectId]
 * @param {Object} [opts]
 * @param {string} [opts.requestOptions]
 * @param {string} [opts.proxy]
 *
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
   * Get array with all projects.
   *
   * @async
   * @returns {Object []} with all projects objects
   * @memberof CucumberStudio
   */
  async getAllProjects() {
    return this.request('/projects').then(data => data.data);
  }

  /**
   * Get project by its ID.
   *
   * @async
   * @param {number | string} [projectId=this.projectId] project ID
   * @returns {Object} project object
   * @memberof CucumberStudio
   */
  async getProjectById(projectId = this.projectId) {
    return this.request(`/projects/${projectId}`).then(data => data.data);
  }

  /**
   * Get project ID by its name.
   *
   * @example
   * const id = await cucumberStudio.getProjectIdByName('someName');
   * @example
   *
   * @async
   * @param {string} name project name
   * @returns {number} project id
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
   * Get proect backup by project ID.
   *
   * @async
   * @param {number | string} [projectId=this.projectId] project id
   * @returns {Object} backup
   * @memberof CucumberStudio
   */
  async getProjectBackupById(projectId = this.projectId) {
    return this.request(`/projects/${projectId}/backups/last`).then(
      data => data,
    );
  }

  /**
   * Get all scenarios of project by its ID.
   *
   * @async
   * @param {number | string} [projectId=this.projectId] project id
   * @returns {Object []} scenarios
   * @memberof CucumberStudio
   */
  async getScenarios(projectId = this.projectId) {
    return this.request(`/projects/${projectId}/scenarios`).then(
      data => data.data,
    );
  }

  /**
   * Get all folders of project by its ID.
   *
   * @param {number | string} [projectId=this.projectId] project ID
   * @returns {Object []} folders' objects
   * @memberof CucumberStudio
   */
  async getFolders(projectId = this.projectId) {
    return this.request(`/projects/${projectId}/folders`).then(
      data => data.data,
    );
  }

  /**
   * Create a scneario in project with given ID.
   *
   * @example
   * const projectId = 154213;
   * const folderId = 12341;
   *
   * const scenarioAttributes = {
   *   name: 'testScenarioName',
   *   'folder-id': folderId,
   * };
   *
   * const scenario = await cucumberStudio.createScenario({
   *   projectId,
   *   scenarioAttributes
   * });
   * @example
   *
   * @param {Object} $0 object with params
   * @param {number | string} [$0.projectId = this.projectId] project ID
   * @param {Object} $0.scenarioAttributes object with attributes for new scenario
   * @returns {Object} created scenario item
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
   * Update scenario attributes.
   *
   * @example
   * const projectId = 154213;
   * const scenarioId = 123412;
   * 
   * const newAttributes = {
      name: 'The new name of the scenario',
      description: 'The new description of the scenario',
    };

    const updatedScenario = await cucumberStudio
      .updateScenario({ projectId, scenarioId, newAttributes })
   * @example
   *
   * @param {Object} $0 object with params
   * @param {number | string} [$0.projectId=this.projectId] project ID
   * @param {number | string} $0.scenarioId scenario ID to update scenario
   * @param {Object} $0.newAttributes object with attributes
   * @returns {Object} updated scenario item
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
   * Delete scenatio by its ID.
   *
   * @param {Object} $0{ projectId = this.projectId, scenarioId }
   * @param {number | string} [$0.projectId=this.projectId]
   * @param {number | string} $0.scenarioId
   * @returns {Object} empty object
   * @memberof CucumberStudio
   */
  async deleteScenario({ projectId = this.projectId, scenarioId }) {
    return this.request
      .delete(`/projects/${projectId}/scenarios/${scenarioId}`)
      .then(data => data);
  }

  /**
   * Sets project ID to instance param.
   *
   * @param {number | string} projectId project ID
   *
   * @memberOf CucumberStudio
   */
  _setProjectId(projectId) {
    this.projectId = projectId;
  }

  /**
   * Create folder with `name` and `parent-id` given in folderAttributes.
   *
   * @example
   * const projectId = 154213;
   * const folderId = 23123;
   *
   * const folderAttributes = {
   *   name: 'testFolderName',
   *   'folder-id': folderId,
   * };
   *
   * const newFolder = await cucumberStudio.createFolder({
   *   projectId,
   *   folderAttributes
   * });
   * @example
   *
   * @param {Object} $0 object with params
   * @param {number | string} [$0.projectId = this.projectId]
   * @param {Object} $0.folderAttributes object with attributes for new folder
   * @returns {Object} created folder item
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
   * Update folder with new attributes.
   * 
   * @example
   * const projectId = 154213;
   * const folderId = 123412;
   * 
   * const newAttributes = {
      "name": 'The new name of the folder',
      "description": 'The new description of the folder',
    };

    const updatedFolder = await cucumberStudio
      .updateFolder({ projectId, folderId, newAttributes })
   * @example
   *
   * @param {Object} $0 object with params
   * @param {number | string} [$0.projectId = this.projectId] project ID
   * @param {number | string} $0.folderId folder id to update
   * @param {Object} $0.newAttributes object with new attributes for update folder
   * @returns {Object} updated folder item
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
   * Delete folder by its ID.
   *
   * @param {Object} $0 object with params
   * @param {number | string} [$0.projectId=this.projectId] project ID
   * @param {number | string} $0.folderId folder ID to delete
   * @returns {Object} empty object
   * @memberof CucumberStudio
   */
  async deleteFolder({ projectId = this.projectId, folderId }) {
    return this.request
      .delete(`/projects/${projectId}/folders/${folderId}`)
      .then(data => data);
  }

  /**
   * Get childern folders of folder by its ID.
   *
   * @param {Object} $0 object with params
   * @param {number | string} [$0.projectId=this.projectId] project ID
   * @param {number | string} $0.folderId folder ID to delete
   * @returns {Object []} array with children folder items
   * @memberof CucumberStudio
   */
  async getChildrenFolders({ projectId = this.projectId, folderId }) {
    return this.request(
      `/projects/${projectId}/folders/${folderId}/children`,
    ).then(data => data);
  }

  /**
   * Delete all children folders of folder by its ID.
   *
   * @param {Object} $0 object with params
   * @param {number | string} [$0.projectId=this.projectId] project ID
   * @param {number | string} $0.folderId folder ID to delete
   * @returns {Object} empty object
   * @memberof CucumberStudio
   */
  async deleteChildrenFolders({ projectId = this.projectId, folderId }) {
    return this.request
      .delete(`/projects/${projectId}/folders/${folderId}/children`)
      .then(data => data);
  }

  /**
   * Get folder scenarios by its ID.
   *
   * @param {Object} $0 object with params
   * @param {number | string} [$0.projectId=this.projectId] project ID
   * @param {number | string} $0.folderId folder ID to delete
   * @returns {Object []} array with folder scenarios items
   * @memberof CucumberStudio
   */
  async getFolderScenarios({ projectId = this.projectId, folderId }) {
    return this.request(
      `/projects/${projectId}/folders/${folderId}/scenarios`,
    ).then(data => data.data);
  }

  /**
   * Delete all scenarios in folder by its ID.
   *
   * @param {Object} $0 object with params
   * @param {number | string} [$0.projectId=this.projectId] project ID
   * @param {number | string} $0.folderId folder ID to delete
   * @returns {Object} empty object
   * @memberof CucumberStudio
   */
  async clearAllScenarios({ projectId = this.projectId, folderId }) {
    return this.request
      .delete(`/projects/${projectId}/folders/${folderId}/scenarios`)
      .then(data => data);
  }
}

module.exports = CucumberStudio;
