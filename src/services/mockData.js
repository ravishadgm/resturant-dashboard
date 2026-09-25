export const seeds = {
  managers: [
    { id:'m1', manager_id:'MGR-001', user_id:'USR-201', branch_id:'BR-001', name:'Aarav Mehta', email:'aarav@restrodesk.com', phone:'+91 98765 42110', status:'ACTIVE', image:'', createdAt:'2026-09-01' },
    { id:'m2', manager_id:'MGR-002', user_id:'USR-202', branch_id:'BR-002', name:'Neha Shah', email:'neha@restrodesk.com', phone:'+91 98111 20304', status:'ACTIVE', image:'', createdAt:'2026-08-29' }
  ],
  settings: [
    { id:'s1', name:'West Region', email:'west@restrodesk.com', address:'16 Riverfront Road, Ahmedabad', location:'Ahmedabad, Gujarat', phone:'+91 79400 12001', image:'', createdAt:'2026-08-28' },
    { id:'s2', name:'South Region', email:'south@restrodesk.com', address:'41 Residency Road, Bengaluru', location:'Bengaluru, Karnataka', phone:'+91 80411 22002', image:'', createdAt:'2026-08-22' }
  ],
  restaurants: [
    { id:'r1', restaurant_id:'REST-001', name:'The Saffron Table', email:'hello@saffrontable.in', address:'12 Ashram Road, Ahmedabad', phone:'+91 98765 10001', status:'ACTIVE', image:'', createdAt:'2026-09-02' },
    { id:'r2', restaurant_id:'REST-002', name:'Olive & Ember', email:'care@oliveember.in', address:'8 Park Street, Kolkata', phone:'+91 98765 10002', status:'INACTIVE', image:'', createdAt:'2026-08-30' }
  ],
  branches: [
    {id:'b1',branch_id:'BR-001',restaurant_id:'REST-001',name:'Adajan Branch',phone:'+91 261 400 1001',address:'Adajan, Surat',latitude:'21.1959',longitude:'72.7933',distance_km:1.2,waiting_count:4,status:'ACTIVE',createdAt:'2026-09-01'},
    {id:'b2',branch_id:'BR-002',restaurant_id:'REST-001',name:'Vesu Branch',phone:'+91 261 400 1002',address:'Vesu, Surat',latitude:'21.1418',longitude:'72.7709',distance_km:2.8,waiting_count:9,status:'ACTIVE',createdAt:'2026-09-02'}
  ],
  customers:[
    {id:'c1',customer_id:'CUS-001',user_id:'USR-301',name:'Demo Customer',email:'customer@restrodesk.com',phone:'+91 98765 33333',status:'ACTIVE',createdAt:'2026-09-20'},
    {id:'c2',customer_id:'CUS-002',user_id:'USR-302',name:'Rohan Kapoor',email:'rohan@example.com',phone:'+91 98765 44102',status:'ACTIVE',createdAt:'2026-09-21'}
  ],
  tables:[
    {id:'t1',table_id:'TBL-001',branch_id:'BR-001',table_number:'T-01',capacity:2,status:'AVAILABLE',createdAt:'2026-09-01'},
    {id:'t2',table_id:'TBL-002',branch_id:'BR-001',table_number:'T-04',capacity:4,status:'AVAILABLE',createdAt:'2026-09-01'},
    {id:'t3',table_id:'TBL-003',branch_id:'BR-001',table_number:'T-05',capacity:4,status:'OCCUPIED',createdAt:'2026-09-01'},
    {id:'t4',table_id:'TBL-004',branch_id:'BR-002',table_number:'T-08',capacity:6,status:'DISABLED',createdAt:'2026-09-01'}
  ],
  tokens:[
    {id:'tk1',token_id:'TOK-001',user_id:'USR-301',device_type:'Android',device_id:'pixel-8-demo',device_token:'fcm_demo_android_token',created_at:'2026-09-24T09:00:00+05:30'},
    {id:'tk2',token_id:'TOK-002',user_id:'USR-301',device_type:'Web',device_id:'chrome-demo',device_token:'fcm_demo_web_token',created_at:'2026-09-24T09:10:00+05:30'}
  ],
  queue: [
    { id:'q1', queue_id:'QUEUE-001', branch_id:'BR-001', customer_id:'CUS-002', queue_number:1, member_count:4, business_date:'2026-09-24', guestName:'Rohan Kapoor', phone:'+91 98765 44102', partySize:4, preference:'Indoor', notes:'One high chair', status:'waiting', quotedWait:25, registered_at:'2026-09-24T10:42:00+05:30', joinedAt:'2026-09-24T10:42:00+05:30' },
    { id:'q2', guestName:'Meera Iyer', phone:'+91 98103 88214', partySize:2, preference:'Window', notes:'', status:'notified', quotedWait:10, joinedAt:'2026-09-24T10:51:00+05:30', notifiedAt:'2026-09-24T11:05:00+05:30' },
    { id:'q3', guestName:'Anika Singh', phone:'+91 99871 22390', partySize:6, preference:'Any', notes:'Birthday dinner', status:'waiting', quotedWait:35, joinedAt:'2026-09-24T10:57:00+05:30' },
    { id:'q4', guestName:'Dev Malhotra', phone:'+91 99202 11745', partySize:3, preference:'Outdoor', notes:'', status:'seated', quotedWait:15, joinedAt:'2026-09-24T10:20:00+05:30', table:'T-08', seatedAt:'2026-09-24T10:38:00+05:30' }
  ],
  queue: [
    { id:'q1', guestName:'Rohan Kapoor', phone:'+91 98765 44102', partySize:4, preference:'Indoor', notes:'One high chair', status:'waiting', quotedWait:25, joinedAt:'2026-09-24T10:42:00+05:30' },
    { id:'q2', guestName:'Meera Iyer', phone:'+91 98103 88214', partySize:2, preference:'Window', notes:'', status:'notified', quotedWait:10, joinedAt:'2026-09-24T10:51:00+05:30', notifiedAt:'2026-09-24T11:05:00+05:30' },
    { id:'q3', guestName:'Anika Singh', phone:'+91 99871 22390', partySize:6, preference:'Any', notes:'Birthday dinner', status:'waiting', quotedWait:35, joinedAt:'2026-09-24T10:57:00+05:30' },
    { id:'q4', guestName:'Dev Malhotra', phone:'+91 99202 11745', partySize:3, preference:'Outdoor', notes:'', status:'seated', quotedWait:15, joinedAt:'2026-09-24T10:20:00+05:30', table:'T-08', seatedAt:'2026-09-24T10:38:00+05:30' }
  ]
};
