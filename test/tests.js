const test = require('ava');

const CucumberStudio = require('../lib');

// eslint-disable-next-line import/no-unresolved
const { token, client, uid } = process.env;

const cucumberStudio = new CucumberStudio({
  token,
  client,
  uid,
});

let projectId;
let folderId;
let scenarioId;

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

test('getScenarios', async t => {
  t.plan(1);

  const scenarios = await cucumberStudio.getScenarios(projectId);

  t.true(Array.isArray(scenarios), 'message');
});

test('getFolders', async t => {
  const folders = await cucumberStudio.getScenarios(projectId);

  t.true(Array.isArray(folders), 'message');
});

test('createFolder', async t => {
  t.plan(2);

  const testFolderName = 'testFolderCreation';

  const folder = await cucumberStudio.createFolder(projectId, {
    name: testFolderName,
  });

  t.is(folder.type, 'folders', 'message');
  t.is(folder.attributes.name, testFolderName, 'message');

  folderId = folder.id;
});

test('createScenario', async t => {
  t.plan(3);

  const testScenarioName = 'testScenarioName';

  const scenario = await cucumberStudio.createScenario(projectId, {
    name: testScenarioName,
    'folder-id': folderId,
  });

  t.is(scenario.type, 'scenarios', 'message');
  t.is(scenario.attributes.name, testScenarioName, 'message');
  t.is(scenario.attributes['folder-id'], +folderId, 'message');

  scenarioId = scenario.id;
});

test('getFolderScenarios', async t => {
  t.plan(3);

  const folderScenarios = await cucumberStudio.getFolderScenarios(
    projectId,
    folderId,
  );

  t.is(folderScenarios.length, 1, 'message');
  t.true(Array.isArray(folderScenarios), 'message');
  t.is(folderScenarios[0].id, scenarioId, 'message');
});

test('updateScenario', async t => {
  t.plan(1);

  const description = 'Description to update';

  const updatedScenario = await cucumberStudio.updateScenario(
    projectId,
    scenarioId,
    { description },
  );

  t.is(updatedScenario.attributes.description, description, 'message');
});

test('deleteScenario', async t => {
  t.plan(1);

  const deleted = await cucumberStudio.deleteScenario(projectId, scenarioId);

  t.is(Object.keys(deleted).length, 0, 'message');
});

test('updateFolder', async t => {
  t.plan(1);

  const description = 'Description to update';

  const updatedFolder = await cucumberStudio.updateFolder(projectId, folderId, {
    description,
  });

  t.is(updatedFolder.attributes.description, description, 'message');
});

test('deleteFolder', async t => {
  t.plan(1);

  const deleted = await cucumberStudio.deleteFolder(projectId, folderId);

  t.is(Object.keys(deleted).length, 0, 'message');
});
