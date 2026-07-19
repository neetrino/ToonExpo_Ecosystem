import { check } from 'k6';

import { API_PREFIX, loadConfig } from './lib/config.js';
import {
  apiGet,
  checkStatus,
  firstApartmentId,
  firstProjectId,
  thinkTime,
  webGet,
} from './lib/http.js';
import { SCENARIO, buildOptions } from './lib/thresholds.js';

const SCENARIO_NAME = SCENARIO.PUBLIC;

export const options = buildOptions(
  SCENARIO_NAME,
  [
    { duration: '30s', target: 5 },
    { duration: '2m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  { includeCacheHit: true, peak: true },
);

export default function publicBrowse() {
  const config = loadConfig();
  const tags = { scenario: SCENARIO_NAME };

  const home = webGet(`${config.baseUrl}/hy`, {
    ...tags,
    endpoint: 'home_html',
  });
  checkStatus(home, 'home html', [200]);

  thinkTime(config.thinkTimeMinSec, config.thinkTimeMaxSec);

  const builders = apiGet(`${API_PREFIX}/builders?locale=hy`, {
    ...tags,
    endpoint: 'catalog_builders',
  });
  checkStatus(builders, 'builders');

  const projects = apiGet(`${API_PREFIX}/projects?page=1&pageSize=12&locale=hy`, {
    ...tags,
    endpoint: 'catalog_projects',
  });
  checkStatus(projects, 'projects list');

  const projectId = firstProjectId(projects) || config.seedProjectId;

  thinkTime(config.thinkTimeMinSec, config.thinkTimeMaxSec);

  const project = apiGet(`${API_PREFIX}/projects/${projectId}?locale=hy`, {
    ...tags,
    endpoint: 'catalog_project_detail',
  });
  checkStatus(project, 'project detail', [200, 404]);

  const apartmentId = firstApartmentId(project) || config.seedApartmentId;

  thinkTime(config.thinkTimeMinSec, config.thinkTimeMaxSec);

  const apartment = apiGet(`${API_PREFIX}/apartments/${apartmentId}?locale=hy`, {
    ...tags,
    endpoint: 'catalog_apartment_detail',
  });
  checkStatus(apartment, 'apartment detail', [200, 404]);

  check(null, {
    'catalog flow completed': () => true,
  });
}
