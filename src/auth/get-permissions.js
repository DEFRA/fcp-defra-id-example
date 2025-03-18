const DEFAULT_SCOPE = 'user'

async function getPermissions (crn, organisationId, token) {
  const personId = await getPersonId(crn, token)
  const { role, privileges } = await getRolesAndPrivileges(personId, organisationId, token)
  const scope = [DEFAULT_SCOPE, ...privileges]
  return { role, scope }
}

async function getPersonId (crn, token) {
  // simulate call to RPS API
  // PATH: /person/3337243/summary
  // METHOD: GET
  // HEADERS:
  //   crn: <crn
  //   Authorization <token>

  const mockResponse = {
    _data: {
      id: '123456'
    }
  }

  return mockResponse._data.id
}

async function getRolesAndPrivileges (personId, organisationId, token) {
  // simulate call to Siti Agri API
  // PATH: /SitiAgriApi/authorisation/organisation/<organisationId>/authorisation
  // METHOD: GET
  // HEADERS:
  //   crn: <personId>
  //   Authorization <token>

  const mockResponse = {
    data: {
      personRoles: [{
        personId: '123456',
        role: 'Farmer'
      }, {
        personId: '654321',
        role: 'Agent'
      }],
      personPrivileges: [{
        personId: '123456',
        privilegeNames: ['Full permission - business']
      }, {
        personId: '654321',
        privilegeNames: ['Submit - bps']
      }, {
        personId: '654321',
        privilegeNames: ['Submit - cs agree']
      }]
    }
  }

  return {
    role: mockResponse.data.personRoles.find(role => role.personId === '123456')?.role ?? 'Unknown',
    privileges: mockResponse.data.personPrivileges.filter(privilege => privilege.personId === '123456').map(privilege => privilege.privilegeNames[0])
  }
}

export { getPermissions }
