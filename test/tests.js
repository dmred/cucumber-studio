const test = require('ava');

const CucumberStudio = require('../lib');

const { TOKEN, CLIENT, UID } = process.env;

const cucumberStudio = new CucumberStudio({
  TOKEN,
  CLIENT,
  UID,
});

let projectId;
let folderId;
let scenarioId;
let childFolderId;

test('getAllProjects', async t => {
  t.plan(1);

  const allProjects = await cucumberStudio.getAllProjects();

  t.true(Array.isArray(allProjects), 'message');

  projectId = await cucumberStudio.getProjectIdByName('testProject');
});

test('getProjectById', async t => {
  t.plan(2);

  const projectById = await cucumberStudio.getProjectById(projectId);

  t.is(projectById.id, projectId, 'message');
  t.is(projectById.type, 'projects', 'message'); // anxious
});

test('getProjectBackupById', async t => {
  t.plan(1);

  const projectBackup = await cucumberStudio.getProjectBackupById(projectId);

  t.true('data' in projectBackup, 'message');
});

test('getFolders', async t => {
  t.plan(2);

  const folders = await cucumberStudio.getFolders(projectId);

  t.true(Array.isArray(folders), 'message');
  t.is(folders[0].type, 'folders', 'message');
});

test('createFolder', async t => {
  t.plan(2);

  const testFolderName = 'testFolderCreation';
  const folderAttributes = {
    name: testFolderName,
  };

  const folder = await cucumberStudio.createFolder({
    projectId,
    folderAttributes,
  });

  t.is(folder.type, 'folders', 'message');
  t.is(folder.attributes.name, testFolderName, 'message');

  folderId = folder.id;
});

test('createScenario', async t => {
  t.plan(3);

  const testScenarioName = 'testScenarioName';

  const scenario = await cucumberStudio.createScenario({
    projectId,
    scenarioAttributes: {
      name: testScenarioName,
      'folder-id': folderId,
    },
  });

  t.is(scenario.type, 'scenarios', 'message');
  t.is(scenario.attributes.name, testScenarioName, 'message');
  t.is(scenario.attributes['folder-id'], +folderId, 'message');

  scenarioId = scenario.id;
});

test('getScenarios', async t => {
  t.plan(2);

  const scenarios = await cucumberStudio.getScenarios(projectId);

  t.true(Array.isArray(scenarios), 'message');
  t.is(scenarios[0].type, 'scenarios', 'message');
});

test('getFolderScenarios', async t => {
  t.plan(3);

  const folderScenarios = await cucumberStudio.getFolderScenarios({
    projectId,
    folderId,
  });

  t.is(folderScenarios.length, 1, 'message');
  t.true(Array.isArray(folderScenarios), 'message');
  t.is(folderScenarios[0].id, scenarioId, 'message');
});

test('updateScenario', async t => {
  t.plan(1);

  const description = 'Description to update';

  const updatedScenario = await cucumberStudio.updateScenario({
    projectId,
    scenarioId,
    newAttributes: { description },
  });

  t.is(updatedScenario.attributes.description, description, 'message');
});

test('deleteScenario', async t => {
  t.plan(1);

  const deleted = await cucumberStudio.deleteScenario({
    projectId,
    scenarioId,
  });

  t.is(Object.keys(deleted).length, 0, 'message');
});

test('updateFolder', async t => {
  t.plan(1);

  const description = 'Description to update';

  const updatedFolder = await cucumberStudio.updateFolder({
    projectId,
    folderId,
    newAttributes: {
      description,
    },
  });

  t.is(updatedFolder.attributes.description, description, 'message');
});

test('getChildrenFolder', async t => {
  t.plan(4);

  const nestedFolderName = 'nestedFolderCreation';

  const folder = await cucumberStudio.createFolder({
    projectId,
    folderAttributes: {
      name: nestedFolderName,
      'parent-id': folderId,
    },
  });

  childFolderId = folder.id;

  t.is(folder.type, 'folders', 'message');
  t.is(folder.attributes.name, nestedFolderName, 'message');

  const childrenFolders = await cucumberStudio.getChildrenFolders({
    projectId,
    folderId,
  });

  t.true(Array.isArray(childrenFolders.data), 'message');
  t.is(childrenFolders.data[0].attributes.name, nestedFolderName, 'message');
});

test('clearAllScenarios', async t => {
  const arrayToCreate = [];

  const MIN = 2;
  const MAX = 5;
  const length = Math.floor(MIN + Math.random() * (MAX + 1 - MIN));

  t.plan(3);

  for (let i = 0; i < length; i += 1) {
    arrayToCreate.push(
      cucumberStudio.createScenario({
        projectId,
        scenarioAttributes: {
          name: `scenarioToDelete_${i}`,
          'folder-id': childFolderId,
        },
      }),
    );
  }

  await Promise.all(arrayToCreate);

  const cleared = await cucumberStudio.clearAllScenarios({
    projectId,
    folderId: childFolderId,
  });

  t.is(Object.keys(cleared).length, 0, 'message');

  const folderScenarios = await cucumberStudio.getFolderScenarios({
    projectId,
    folderId: childFolderId,
  });

  t.is(folderScenarios.length, 0, 'message');
  t.true(Array.isArray(folderScenarios), 'message');
});

test('deleteChildrenFolder', async t => {
  t.plan(3);

  const deletedChildren = await cucumberStudio.deleteChildrenFolders({
    projectId,
    folderId,
  });

  t.is(Object.keys(deletedChildren).length, 0, 'message');

  const childrenFolders = await cucumberStudio.getChildrenFolders({
    projectId,
    folderId,
  });

  t.true(Array.isArray(childrenFolders.data), 'message');
  t.is(childrenFolders.data.length, 0, 'message');
});

test('deleteFolder', async t => {
  t.plan(1);

  const deleted = await cucumberStudio.deleteFolder({ projectId, folderId });

  t.is(Object.keys(deleted).length, 0, 'message');
});
