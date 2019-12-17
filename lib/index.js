/* eslint-disable no-underscore-dangle */
const request = require('request-promise-native');
const useragentFromSeed = require('useragent-from-seed');

const baseUrl = 'https://studio.cucumber.io/api';

class CucumberStudio {
  constructor(
    { token, client, uid, projectId },
    { requestOptions, proxy } = {},
  ) {
    this.token = token;
    this.client = client;
    this.uid = uid;
    this.projectId = projectId || '';

    const userAgent = useragentFromSeed(token);

    const _requestOptions = requestOptions || {};

    _requestOptions.baseUrl = baseUrl;
    _requestOptions.uri = '';
    _requestOptions.headers = {
      'User-Agent': userAgent,
      Accept: 'application/vnd.api+json; version=1',
      'access-token': token,
      client,
      uid,
      Referer: baseUrl,
    };
    _requestOptions.proxy = proxy;
    _requestOptions.json = true;
    this.request = request.defaults(_requestOptions);
  }

  async getAllProjects() {
    return this.request('/projects').then(data => data.data);
  }

  async getProjectById(projectId = this.projectId) {
    return this.request(`/projects/${projectId}`).then(data => data.data);
  }

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

  async getProjectBackupById(projectId = this.projectId) {
    return this.request(`/projects/${projectId}/backups`).then(
      data => data.data,
    );
  }

  async getScenarios(projectId = this.projectId) {
    return this.request(`/projects/${projectId}/scenarios`).then(
      data => data.data,
    );
  }

  async getFolders(projectId = this.projectId) {
    return this.request(`/projects/${projectId}/folders`).then(
      data => data.data,
    );
  }

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

  async deleteScenario(projectId, scenarioId) {
    return this.request
      .delete(`/projects/${projectId}/scenarios/${scenarioId}`)
      .then(data => data);
  }

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

  async deleteFolder(projectId, folderId) {
    return this.request
      .delete(`/projects/${projectId}/folders/${folderId}`)
      .then(data => data);
  }

  async getChildrenFolders(folderId) {
    return this.request(
      `/projects/${this.projectId}/folders/${folderId}/children`,
    ).then(data => data.data);
  }

  async deleteChildrenFolders(folderId) {
    return this.request
      .delete(`/projects/${this.projectId}/folders/${folderId}/children`)
      .then(data => data.data);
  }

  async getFolderScenarios(projectId, folderId) {
    return this.request(
      `/projects/${projectId}/folders/${folderId}/scenarios`,
    ).then(data => data.data);
  }

  async clearAllScenarios(folderId) {
    return this.request
      .delete(`/projects/${this.projectId}/folders/${folderId}/scenarios`)
      .then(data => data.data);
  }
}

module.exports = CucumberStudio;
