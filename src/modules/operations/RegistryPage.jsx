import { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Plus } from 'lucide-react';
import CommonTable from '../../components/common/CommonTable';
import EntityForm from '../../components/common/EntityForm';
import PageHeader from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { entityService } from '../../services/entityService';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const activeOptions=['ACTIVE','INACTIVE'];
export const registryConfigs = {
  branches:{singular:'Branch',title:'Branches',description:'Manage restaurant branches, ownership and map locations.',fields:[
    {name:'branch_id',label:'Branch ID',required:false,placeholder:'Generated automatically'},{name:'restaurant_id',label:'Restaurant ID',placeholder:'e.g. REST-001'},{name:'name',label:'Branch name',placeholder:'e.g. Adajan Branch'},{name:'phone',label:'Phone number',placeholder:'+91 98765 43210'},{name:'address',label:'Address',as:'textarea'},{name:'latitude',label:'Latitude',type:'number'},{name:'longitude',label:'Longitude',type:'number'},{name:'distance_km',label:'Distance (KM)',type:'number',required:false},{name:'waiting_count',label:'Current waiting count',type:'number',required:false},{name:'status',label:'Status',as:'select',options:activeOptions}
  ]},
  managers:{singular:'Manager',title:'Managers',description:'Assign managers to a specific restaurant branch.',fields:[
    {name:'manager_id',label:'Manager ID',required:false,placeholder:'Generated automatically'},{name:'user_id',label:'User ID',required:false,placeholder:'Generated automatically'},{name:'branch_id',label:'Branch ID',placeholder:'e.g. BR-001'},{name:'name',label:'Full name'},{name:'email',label:'Email address',type:'email'},{name:'phone',label:'Phone number'},{name:'status',label:'Status',as:'select',options:activeOptions}
  ]},
  customers:{singular:'Customer',title:'Customers',description:'Search and reuse customer accounts to prevent duplicates.',fields:[
    {name:'customer_id',label:'Customer ID',required:false,placeholder:'Generated automatically'},{name:'user_id',label:'User ID',required:false,placeholder:'Generated automatically'},{name:'name',label:'Full name'},{name:'email',label:'Email address',type:'email',required:false},{name:'phone',label:'Phone number'},{name:'status',label:'Status',as:'select',options:activeOptions}
  ]},
  tables:{singular:'Table',title:'Restaurant tables',description:'Manage branch tables, capacity and live availability.',fields:[
    {name:'table_id',label:'Table ID',required:false,placeholder:'Generated automatically'},{name:'branch_id',label:'Branch ID',placeholder:'e.g. BR-001'},{name:'table_number',label:'Table number',placeholder:'e.g. T-08'},{name:'capacity',label:'Capacity',type:'number'},{name:'status',label:'Status',as:'select',options:['AVAILABLE','OCCUPIED','DISABLED']}
  ]},
  tokens:{singular:'Device',title:'Device tokens',description:'Manage FCM tokens. One user may register multiple devices.',fields:[
    {name:'token_id',label:'Token ID',required:false,placeholder:'Generated automatically'},{name:'user_id',label:'User ID'},{name:'device_type',label:'Device type',as:'select',options:['Android','Ios','Web']},{name:'device_id',label:'Device ID'},{name:'device_token',label:'FCM device token',as:'textarea'},{name:'created_at',label:'Created at',required:false}
  ]},
  restaurants:{singular:'Restaurant',title:'Restaurants',description:'Create, update and activate restaurant accounts.',fields:[
    {name:'restaurant_id',label:'Restaurant ID',required:false,placeholder:'Generated automatically'},{name:'name',label:'Restaurant name'},{name:'email',label:'Email address',type:'email'},{name:'phone',label:'Phone number'},{name:'address',label:'Address',as:'textarea'},{name:'status',label:'Status',as:'select',options:activeOptions}
  ]}
};

const pretty=value=>value===undefined||value===null||value===''?'—':String(value);

export default function RegistryPage({ kind, readOnly=false, title, description }) {
  const config=registryConfigs[kind]; const toast=useToast(); const {user}=useAuth();
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true); const [mode,setMode]=useState(null); const [active,setActive]=useState(null);
  const load=()=>{setLoading(true);entityService.list(kind).then(data=>{setRows(data);setLoading(false)})};
  useEffect(load,[kind]);
  const save=async values=>{
    if(kind==='customers'&&mode==='add'){const existing=rows.find(row=>row.phone.replace(/\D/g,'')===values.phone.replace(/\D/g,''));if(existing){setActive(existing);setMode('view');toast('Existing customer found and reused.');return}}
    const stamped={...values}; config.fields.filter(field=>field.name.endsWith('_id')).forEach(field=>{if(!stamped[field.name]) stamped[field.name]=`${field.name.replace('_id','').toUpperCase()}-${Date.now().toString().slice(-6)}`});
    if(kind==='branches'&&user.role===ROLES.RESTAURANT) stamped.restaurant_id=user.restaurant_id;
    if(mode==='edit'){await entityService.update(kind,active.id,stamped);toast(`${config.singular} updated`)}else{await entityService.create(kind,stamped);toast(`${config.singular} created`)} setMode(null);load();
  };
  const displayFields=useMemo(()=>config.fields.filter(field=>!['address','device_token','created_at'].includes(field.name)),[config]);
  const columns=[...displayFields.map(field=>({key:field.name,label:field.label,render:value=>field.name==='status'?<span className={`registry-status ${String(value).toLowerCase()}`}>{pretty(value)}</span>:pretty(value)})),{key:'actions',label:'Actions',sortable:false,className:'actions-col',render:(_,row)=><div className="row-actions"><button title="View" onClick={()=>{setActive(row);setMode('view')}}><Eye/></button>{!readOnly&&<button title="Edit" onClick={()=>{setActive(row);setMode('edit')}}><Pencil/></button>}</div>}];
  const visibleRows=user.role===ROLES.MANAGER&&kind==='tables'?rows.filter(row=>row.branch_id===user.branch_id):user.role===ROLES.RESTAURANT&&kind==='branches'?rows.filter(row=>row.restaurant_id===user.restaurant_id):rows;
  return <><PageHeader eyebrow="OPERATIONS" title={title||config.title} description={description||config.description} action={!readOnly&&<button className="btn primary" onClick={()=>{setActive(null);setMode('add')}}><Plus size={17}/> Add {config.singular}</button>}/><CommonTable columns={columns} data={visibleRows} loading={loading} searchPlaceholder={`Search ${config.title.toLowerCase()}…`}/>
    <Modal open={mode==='add'||mode==='edit'} title={`${mode==='edit'?'Edit':'Add'} ${config.singular}`} onClose={()=>setMode(null)} size="wide"><EntityForm initial={mode==='edit'?active:null} fields={config.fields} onCancel={()=>setMode(null)} onSubmit={save} submitLabel={mode==='edit'?'Save changes':`Add ${config.singular}`}/></Modal>
    <Modal open={mode==='view'} title={`${config.singular} details`} onClose={()=>setMode(null)} size="wide"><div className="registry-detail">{config.fields.map(field=><div key={field.name}><span>{field.label}</span><strong>{pretty(active?.[field.name])}</strong></div>)}<div><span>Created at</span><strong>{active?.createdAt?new Date(active.createdAt).toLocaleString():'—'}</strong></div><div><span>Updated at</span><strong>{active?.updatedAt?new Date(active.updatedAt).toLocaleString():'—'}</strong></div></div><footer className="modal-actions"><button className="btn secondary" onClick={()=>setMode(null)}>Close</button>{!readOnly&&<button className="btn primary" onClick={()=>setMode('edit')}><Pencil size={16}/> Edit</button>}</footer></Modal>
  </>;
}
