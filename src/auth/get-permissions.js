const DEFAULT_SCOPE = 'user'

async function getPermissions (crn, organisationId, token) {
  const personId = await getPersonId(crn, token)
  const { role, privileges } = await getRolesAndPrivileges(personId, organisationId, token)
  const scope = [DEFAULT_SCOPE, ...privileges]
  return { role, scope }
}

async function getPersonId (crn, token) {
  // simulate call to RPS API
  // Only id is needed for mapping roles, but other fields shown for context for what else is available
  // PATH: /person/3337243/summary
  // METHOD: GET
  // HEADERS:
  //   crn: <crn
  //   Authorization <token>

  const mockResponse = {
    _data: {
      id: '123456',
      customerReferenceNumber: '1234567890', // crn
      title: 'Mr',
      firstName: 'Andrew',
      lastName: 'Farmer',
      landline: '01234567890',
      mobile: '01234567890',
      email: 'a.farmer@farms.com',
      address: {
        address1: 'Address line 1',
        address2: 'Address line 2',
        address3: 'Address line 3',
        address4: 'Address line 4',
        address5: 'Address line 5',
        city: 'City',
        county: 'County',
        postcode: 'FA1 1RM',
        country: 'UK'
      },
      doNotContact: false,
      locked: false
    }
  }

  return mockResponse._data.id
}

async function getRolesAndPrivileges (personId, organisationId, token) {
  // simulate call to Siti Agri API
  // returns all roles and privileges for so need to filter for logged in user
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
