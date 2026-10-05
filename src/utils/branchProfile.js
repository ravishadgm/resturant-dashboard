export const BRANCH_PROFILE_FIELDS = [
  {name:'name',label:'Branch name',required:true},
  {name:'address',label:'Branch address'},
  {name:'city',label:'City',required:true},
  {name:'latitude',label:'Latitude',type:'number',min:-90,max:90,step:'any'},
  {name:'longitude',label:'Longitude',type:'number',min:-180,max:180,step:'any'},
  {name:'slot_interval_minutes',label:'Slot interval (minutes)',type:'number',min:1,required:true},
  {name:'slot_capacity',label:'Slot capacity',type:'number',min:1,required:true},
  {name:'advance_booking_days',label:'Advance booking (days)',type:'number',min:0},
  {name:'notify_lead_minutes',label:'Notification lead (minutes)',type:'number',min:0,required:true},
  {name:'rating',label:'Rating',type:'number',min:0,max:5,step:'any'},
  {name:'map_url',label:'Map URL',type:'url'},
];
export const branchProfileForm = branch => ({...Object.fromEntries(BRANCH_PROFILE_FIELDS.map(field=>[field.name,branch[field.name]??''])),queue_enabled:branch.queue_enabled??false});
export const branchProfilePayload = form => {
  const payload = {};
  for (const field of BRANCH_PROFILE_FIELDS) {
    const value = form[field.name];
    if (field.required && (value == null || String(value).trim() === '')) throw new Error(`${field.label} is required.`);
    if (field.type === 'number') {
      if (value == null || value === '') {
        if (field.name !== 'advance_booking_days') payload[field.name] = null;
        continue;
      }
      const number = Number(value);
      if (!Number.isFinite(number) || number < field.min || (field.max !== undefined && number > field.max) || (field.step !== 'any' && !Number.isInteger(number))) throw new Error(`Enter a valid ${field.label.toLowerCase()}.`);
      payload[field.name] = number;
    } else payload[field.name] = String(value ?? '').trim();
  }
  if (payload.map_url) {
    let url;
    try { url = new URL(payload.map_url); } catch { throw new Error('Enter a valid map URL.'); }
    if (!['http:','https:'].includes(url.protocol)) throw new Error('Enter an HTTP or HTTPS map URL.');
  }
  payload.queue_enabled = form.queue_enabled === true;
  return payload;
};
