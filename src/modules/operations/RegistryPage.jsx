import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Pencil, Plus } from 'lucide-react';
import CommonTable from '../../components/common/CommonTable';
import ServerTable from '../../components/common/ServerTable';
import EntityForm from '../../components/common/EntityForm';
import PageHeader from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { entityService } from '../../services/entityService';
import { restaurantApi } from '../../api/restaurantApi';
import { branchApi } from '../../api/branchApi';
import { managerApi } from '../../api/managerApi';
import { customerApi } from '../../api/customerApi';
import { tableApi } from '../../api/tableApi';
import { API_BASE_URL } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const activeOptions=['ACTIVE','INACTIVE'];
const branchUpdateFields=[
  {name:'name',label:'Branch name'},
  {name:'city',label:'City'},
  {name:'email',label:'Email address',type:'email'},
  {name:'phone',label:'Phone number'},
  {name:'latitude',label:'Latitude',type:'number',step:'any'},
  {name:'longitude',label:'Longitude',type:'number',step:'any'}
];
const restaurantBranchFields=[
  {name:'name',label:'Branch name',placeholder:'e.g. Adajan Branch'},
  {name:'address',label:'Address',as:'textarea',placeholder:'e.g. Adajan, Surat'},
  {name:'city',label:'City',placeholder:'e.g. Surat'},
  {name:'latitude',label:'Latitude',type:'number',step:'any'},
  {name:'longitude',label:'Longitude',type:'number',step:'any'},
  {name:'phone',label:'Phone number'}
];
const branchListFields=[
  {name:'branch_id',label:'Branch ID'},
  {name:'restaurant_name',label:'Restaurant'},
  {name:'name',label:'Branch name'},
  {name:'address',label:'Address'},
  {name:'city',label:'City'},
  {name:'latitude',label:'Latitude'},
  {name:'longitude',label:'Longitude'},
  {name:'phone',label:'Phone'},
  {name:'email',label:'Email'},
  {name:'status',label:'Status'},
  {name:'queue_enabled',label:'Queue'},
  {name:'created_at',label:'Created at'},
  {name:'updated_at',label:'Updated at'}
];
const managerListFields=[
  {name:'manager_id',label:'Manager ID'},
  {name:'branch_name',label:'Branch'},
  {name:'name',label:'Manager name'},
  {name:'email',label:'Email'},
  {name:'phone',label:'Phone'},
  {name:'status',label:'Status'},
  {name:'created_at',label:'Created at'},
  {name:'updated_at',label:'Updated at'}
];
const managerCreateFields=[
  {name:'name',label:'Manager name',placeholder:'e.g. Branch Manager'},
  {name:'email',label:'Email',type:'email',placeholder:'manager@example.com'},
  {name:'phone',label:'Phone'},
  {name:'password',label:'Password',type:'password',minLength:8},
  {name:'branch_id',label:'Branch',as:'select',options:[]}
];
const customerUpdateFields=[
  {name:'status',label:'Status',as:'select',options:activeOptions}
];
const customerListFields=[
  {name:'customer_id',label:'Customer ID'},
  {name:'name',label:'Customer name'},
  {name:'phone',label:'Phone'},
  {name:'email',label:'Email'},
  {name:'status',label:'Status'},
  {name:'latitude',label:'Latitude'},
  {name:'longitude',label:'Longitude'},
  {name:'created_at',label:'Created at'},
  {name:'updated_at',label:'Updated at'}
];
const tableListFields=[
  {name:'table_id',label:'Table ID'},
  {name:'table_number',label:'Table number'},
  {name:'capacity',label:'Capacity'},
  {name:'status',label:'Status'},
  {name:'created_at',label:'Created at'},
  {name:'updated_at',label:'Updated at'}
];
const restaurantListFields=[
  {name:'name',label:'Name'},
  {name:'email',label:'Email'},
  {name:'phone',label:'Phone'},
  {name:'restaurant_name',label:'Restaurant name'},
  {name:'restaurant_description',label:'Restaurant description'},
  {name:'restaurant_phone',label:'Restaurant phone'},
  {name:'restaurant_address',label:'Restaurant address'},
  {name:'logo',label:'Logo'},
  {name:'status',label:'Status'}
];
export const registryConfigs = {
  branches:{singular:'Branch',title:'Branches',description:'Manage restaurant branches, ownership and map locations.',fields:[
    {name:'restaurant_id',label:'Restaurant ID',type:'number',placeholder:'e.g. 1'},{name:'name',label:'Branch name',placeholder:'e.g. Admin Branch'},{name:'city',label:'City',placeholder:'e.g. Surat'},{name:'email',label:'Email address',type:'email'},{name:'phone',label:'Phone number'},{name:'latitude',label:'Latitude',type:'number',step:'any'},{name:'longitude',label:'Longitude',type:'number',step:'any'}
  ]},
  managers:{singular:'Manager',title:'Managers',description:'Assign managers to a specific restaurant branch.',fields:[
    {name:'manager_id',label:'Manager ID',required:false,placeholder:'Generated automatically'},{name:'user_id',label:'User ID',required:false,placeholder:'Generated automatically'},{name:'branch_id',label:'Branch ID',placeholder:'e.g. BR-001'},{name:'name',label:'Full name'},{name:'email',label:'Email address',type:'email'},{name:'phone',label:'Phone number'},{name:'status',label:'Status',as:'select',options:activeOptions}
  ]},
  customers:{singular:'Customer',title:'Customers',description:'Search and reuse customer accounts to prevent duplicates.',fields:[
    {name:'customer_id',label:'Customer ID',required:false,placeholder:'Generated automatically'},{name:'user_id',label:'User ID',required:false,placeholder:'Generated automatically'},{name:'name',label:'Full name'},{name:'email',label:'Email address',type:'email',required:false},{name:'phone',label:'Phone number'},{name:'status',label:'Status',as:'select',options:activeOptions}
  ]},
  tables:{singular:'Table',title:'Restaurant tables',description:'Manage branch tables, capacity and live availability.',fields:[
    {name:'branch_id',label:'Branch',as:'select',options:[]},{name:'table_number',label:'Table number',placeholder:'e.g. T9'},{name:'capacity',label:'Capacity',type:'number',min:1},{name:'status',label:'Status',as:'select',options:['AVAILABLE','OCCUPIED','DISABLED']}
  ]},
  restaurants:{singular:'Restaurant',title:'Restaurants',description:'Create, update and activate restaurant accounts.',fields:[
    {name:'name',label:'Name',placeholder:'e.g. Restaurant Owner'},{name:'email',label:'Email',type:'email'},{name:'phone',label:'Phone'},{name:'password',label:'Password',type:'password',minLength:8,placeholder:'Minimum 8 characters'},{name:'restaurant_name',label:'Restaurant name',placeholder:'e.g. Spice Hub'},{name:'restaurant_description',label:'Restaurant description',as:'textarea'},{name:'restaurant_phone',label:'Restaurant phone'},{name:'restaurant_address',label:'Restaurant address',as:'textarea'},{name:'logo',label:'Logo',type:'file',accept:'image/*',required:false}
  ]}
};

const pretty=value=>value===undefined||value===null||value===''?'—':String(value);
const mediaUrl=value=>!value?'':/^https?:\/\//i.test(value)?value:`${API_BASE_URL}${value.startsWith('/')?'':'/'}${value}`;
const renderRegistryValue=(field,value)=>{
  if(field.name==='status')return <span className={`registry-status ${String(value).toLowerCase()}`}>{pretty(value)}</span>;
  if(field.name==='queue_enabled')return <span className={`registry-status ${value?'active':'inactive'}`}>{value?'Enabled':'Disabled'}</span>;
  if(['created_at','updated_at'].includes(field.name))return value?new Date(value).toLocaleString():'—';
  if(field.name==='logo')return value?<img className="restaurant-logo-thumb" src={mediaUrl(value)} alt="Restaurant logo"/>:pretty(value);
  return pretty(value);
};

const withoutPassword=account=>{if(!account)return account;const {password,...safeAccount}=account;return safeAccount};
const normalizeRestaurant=row=>{
  const owner=row.owner||row.user||{}; const {password,...safeRow}=row;
  return {...safeRow,owner:withoutPassword(row.owner),user:withoutPassword(row.user),id:row.id||row.restaurant_id||crypto.randomUUID(),name:owner.name||row.owner_name||'',email:owner.email||row.owner_email||row.email||'',phone:owner.phone||row.owner_phone||row.phone||'',restaurant_name:row.restaurant_name||row.restaurant?.name||row.name||'',description:row.description||row.restaurant_description||'',restaurant_description:row.description||row.restaurant_description||'',restaurant_phone:row.restaurant_phone||row.restaurant?.phone||row.phone||'',restaurant_address:row.restaurant_address||row.address||'',logo:row.logo||row.image||'',createdAt:row.createdAt||row.created_at,updatedAt:row.updatedAt||row.updated_at};
};
const normalizeBranch=row=>({...row,id:row.id||row.branch_id||crypto.randomUUID(),restaurant_name:row.restaurant_name||row.restaurant?.name||'',createdAt:row.createdAt||row.created_at,updatedAt:row.updatedAt||row.updated_at});
const normalizeManager=row=>({
  ...row,
  user:withoutPassword(row.user),
  id:row.id||row.manager_id||crypto.randomUUID(),
  name:row.user?.name||row.name||'',
  email:row.user?.email||row.email||'',
  phone:row.user?.phone||row.phone||'',
  restaurant_name:row.restaurant?.name||row.restaurant_name||'',
  branch_name:row.branch?.name||row.branch_name||'',
  createdAt:row.createdAt||row.created_at,
  updatedAt:row.updatedAt||row.updated_at
});
const normalizeCustomer=row=>({
  ...row,
  user:withoutPassword(row.user),
  id:row.id||row.customer_id||crypto.randomUUID(),
  name:row.name||row.user?.name||'',
  email:row.email||row.user?.email||'',
  phone:row.phone||row.user?.phone||'',
  createdAt:row.createdAt||row.created_at,
  updatedAt:row.updatedAt||row.updated_at
});
const normalizeTable=row=>({
  ...row,
  id:row.id||row.table_id||crypto.randomUUID(),
  branch_name:row.branch?.name||row.branch_name||'',
  createdAt:row.createdAt||row.created_at,
  updatedAt:row.updatedAt||row.updated_at
});

export default function RegistryPage({ kind, readOnly=false, title, description }) {
  const config=registryConfigs[kind]; const toast=useToast(); const {user}=useAuth();
  const branchScope=user.role===ROLES.RESTAURANT?'restaurant':'admin';
  const loggedInRestaurantId=String(user.restaurant_id||user.restaurant?.restaurant_id||user.user_id||'');
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true); const [mode,setMode]=useState(null); const [active,setActive]=useState(null); const [saving,setSaving]=useState(false); const [formError,setFormError]=useState(''); const [restaurantTotal,setRestaurantTotal]=useState(0); const [branchTotal,setBranchTotal]=useState(0); const [managerTotal,setManagerTotal]=useState(0); const [customerTotal,setCustomerTotal]=useState(0); const [tableTotal,setTableTotal]=useState(0); const [restaurantOptions,setRestaurantOptions]=useState([]); const [branchOptions,setBranchOptions]=useState([]); const [managerBranchId,setManagerBranchId]=useState(''); const [tableBranchId,setTableBranchId]=useState('');
  const lastQueryRef=useRef({page:1,limit:10,search:''});
  const load=async(params={page:1,limit:10,search:''},selectedManagerBranchId=managerBranchId,selectedTableBranchId=tableBranchId)=>{
    lastQueryRef.current=params;
    setLoading(true);
    try{
      if(kind==='restaurants'){
        const response=await restaurantApi.list(params);const data=response?.data??response;const restaurants=Array.isArray(data)?data:data?.restaurants||data?.items||data?.rows||data?.records||data?.data||[];const pagination=data?.pagination||data?.meta||response?.pagination||response?.meta||{};
        setRows(restaurants.map(normalizeRestaurant));setRestaurantTotal(Number(pagination.total??pagination.totalRecords??pagination.totalItems??data?.total??response?.total??restaurants.length));
      }else if(kind==='branches'){
        const response=await branchApi.list({...params,scope:branchScope});const data=response?.data??response;const branches=Array.isArray(data)?data:data?.branches||data?.items||data?.rows||data?.records||data?.data||[];const pagination=data?.pagination||data?.meta||response?.pagination||response?.meta||{};
        const sessionRestaurantName=user.restaurant_name||user.restaurant?.name||user.name||'';
        setRows(branches.map(row=>normalizeBranch(branchScope==='restaurant'&&!row.restaurant_name&&!row.restaurant?{...row,restaurant_name:sessionRestaurantName}:row)));setBranchTotal(Number(pagination.total??pagination.totalRecords??pagination.totalItems??data?.total??response?.total??branches.length));
      }else if(kind==='managers'){
        if(branchScope==='restaurant'&&!selectedManagerBranchId){setRows([]);setManagerTotal(0);return}
        const response=await managerApi.list({...params,scope:branchScope,branchId:selectedManagerBranchId});const data=response?.data??response;const managers=Array.isArray(data)?data:data?.managers||data?.items||data?.rows||data?.records||data?.data||[];const pagination=data?.pagination||data?.meta||response?.pagination||response?.meta||{};
        setRows(managers.map(normalizeManager));setManagerTotal(Number(pagination.total??pagination.totalRecords??pagination.totalItems??data?.total??response?.total??managers.length));
      }else if(kind==='customers'){
        const response=await customerApi.list(params);const data=response?.data??response;const customers=Array.isArray(data)?data:data?.customers||data?.items||data?.rows||data?.records||data?.data||[];const pagination=data?.pagination||data?.meta||response?.pagination||response?.meta||{};
        setRows(customers.map(normalizeCustomer));setCustomerTotal(Number(pagination.total??pagination.totalRecords??pagination.totalItems??data?.total??response?.total??customers.length));
      }else if(kind==='tables'){
        if(branchScope==='restaurant'&&!selectedTableBranchId){setRows([]);setTableTotal(0);return}
        const response=await tableApi.list({...params,scope:branchScope,branchId:selectedTableBranchId});const data=response?.data??response;const tables=Array.isArray(data)?data:data?.tables||data?.items||data?.rows||data?.records||data?.data||[];const pagination=data?.pagination||data?.meta||response?.pagination||response?.meta||{};
        setRows(tables.map(normalizeTable));setTableTotal(Number(pagination.total??pagination.totalRecords??pagination.totalItems??data?.total??response?.total??tables.length));
      }else setRows(await entityService.list(kind));
    }catch(error){setRows([]);if(kind==='restaurants')setRestaurantTotal(0);if(kind==='branches')setBranchTotal(0);if(kind==='managers')setManagerTotal(0);if(kind==='customers')setCustomerTotal(0);if(kind==='tables')setTableTotal(0);toast(error.message)}finally{setLoading(false)}
  };
  useEffect(()=>{if(['managers','tables'].includes(kind)&&branchScope==='restaurant')return;load()},[kind,branchScope]);
  useEffect(()=>{
    if(kind!=='branches'||branchScope!=='admin')return;
    let current=true;
    const loadRestaurantOptions=async()=>{
      try{
        const response=await restaurantApi.list({page:1,limit:100,search:''});const data=response?.data??response;const restaurants=Array.isArray(data)?data:data?.restaurants||data?.items||data?.rows||data?.records||data?.data||[];
        if(current)setRestaurantOptions(restaurants.map(row=>({value:String(row.restaurant_id||row.id),label:`${row.restaurant_name||row.name||'Restaurant'} (ID: ${row.restaurant_id||row.id})`})));
      }catch(error){if(current)toast(error.message)}
    };
    loadRestaurantOptions();
    return()=>{current=false};
  },[kind,branchScope]);
  useEffect(()=>{
    if(kind!=='tables'&&!(kind==='managers'&&branchScope==='restaurant'))return;
    let current=true;
    const loadBranchOptions=async()=>{
      try{
        const useOptions=kind==='managers'||branchScope==='restaurant';
        const response=useOptions?await branchApi.options({scope:branchScope}):await branchApi.list({page:1,limit:100,search:''});const data=response?.data??response;const branches=Array.isArray(data)?data:data?.branches||data?.items||data?.rows||data?.records||data?.data||[];
        if(!current)return;
        const options=branches.map(row=>({value:String(row.branch_id||row.id),label:`${row.name||row.branch_name||'Branch'} (ID: ${row.branch_id||row.id})`}));
        setBranchOptions(options);
        if(kind==='managers'){
          const initialBranch=options[0]?.value||'';
          setManagerBranchId(initialBranch);
          load({page:1,limit:10,search:''},initialBranch);
        }else if(kind==='tables'&&branchScope==='restaurant'){
          const initialBranch=options[0]?.value||'';
          setTableBranchId(initialBranch);
          load({page:1,limit:10,search:''},managerBranchId,initialBranch);
        }
      }catch(error){if(current)toast(error.message)}
    };
    loadBranchOptions();
    return()=>{current=false};
  },[kind,branchScope]);
  useEffect(()=>{setFormError('')},[mode]);
  useEffect(()=>{
    if(kind!=='branches'||!restaurantOptions.length)return;
    setRows(current=>current.map(row=>{
      if(row.restaurant_name)return row;
      const option=restaurantOptions.find(item=>String(item.value)===String(row.restaurant_id));
      return option?{...row,restaurant_name:option.label.replace(/ \(ID:.*\)$/,'')}:row;
    }));
  },[kind,restaurantOptions]);
  const refreshAfterSave=async message=>{
    setMode(null);
    setActive(null);
    await load(lastQueryRef.current,managerBranchId,tableBranchId);
    toast(message);
  };
  const save=async values=>{
    setSaving(true); setFormError('');
    try {
      if(kind==='restaurants'&&mode==='add'){
        await restaurantApi.create(values);
        await refreshAfterSave('Restaurant created'); return;
      }
      if(kind==='restaurants'&&mode==='edit'){
        const restaurantId=active.restaurant_id||active.id;
        if(!restaurantId)throw new Error('Restaurant ID is missing.');
        await restaurantApi.update(restaurantId,values);
        await refreshAfterSave('Restaurant updated'); return;
      }
      if(kind==='branches'&&mode==='add'){
        const branchValues=branchScope==='restaurant'?{...values,restaurant_id:loggedInRestaurantId}:values;
        await branchApi.create(branchValues,branchScope);
        await refreshAfterSave('Branch created');return;
      }
      if(kind==='branches'&&mode==='edit'){
        const branchId=active.branch_id||active.id;if(!branchId)throw new Error('Branch ID is missing.');
        const branchValues=branchScope==='restaurant'?{...values,restaurant_id:loggedInRestaurantId}:values;
        await branchApi.update(branchId,branchValues,branchScope);
        await refreshAfterSave('Branch updated');return;
      }
      if(kind==='managers'&&mode==='add'&&branchScope==='restaurant'){
        await managerApi.create(values);
        await refreshAfterSave('Manager created');return;
      }
      if(kind==='customers'&&mode==='edit'){
        const customerId=active.customer_id||active.id;if(!customerId)throw new Error('Customer ID is missing.');
        await customerApi.updateStatus(customerId,values.status);
        await refreshAfterSave('Customer status updated');return;
      }
      if(kind==='tables'&&mode==='add'){
        await tableApi.create(values,branchScope);
        await refreshAfterSave('Table created');return;
      }
      const stamped={...values}; config.fields.filter(field=>field.name.endsWith('_id')).forEach(field=>{if(!stamped[field.name]) stamped[field.name]=`${field.name.replace('_id','').toUpperCase()}-${Date.now().toString().slice(-6)}`});
      if(mode==='edit'){await entityService.update(kind,active.id,stamped);await refreshAfterSave(`${config.singular} updated`)}else{await entityService.create(kind,stamped);await refreshAfterSave(`${config.singular} created`)}
    } catch(error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };
  const restaurantEditFields=useMemo(()=>[
    ...config.fields.map(field=>field.name==='password'?{...field,required:false,placeholder:'Leave blank to keep current password'}:field),
    {name:'status',label:'Status',as:'select',options:activeOptions}
  ],[config]);
  const branchCreateFields=useMemo(()=>config.fields.map(field=>field.name==='restaurant_id'?{...field,label:'Restaurant',as:'select',type:undefined,options:[{value:'',label:'Select restaurant'},...restaurantOptions]}:field),[config,restaurantOptions]);
  const restaurantBranchCreateFields=restaurantBranchFields;
  const restaurantBranchEditFields=useMemo(()=>[
    ...restaurantBranchCreateFields,
    {name:'queue_enabled',label:'Queue enabled',as:'select',options:[{value:'true',label:'Enabled'},{value:'false',label:'Disabled'}]}
  ],[restaurantBranchCreateFields]);
  const tableCreateFields=useMemo(()=>config.fields.map(field=>field.name==='branch_id'?{...field,options:[{value:'',label:'Select branch'},...branchOptions]}:field),[config,branchOptions]);
  const managerCreateFormFields=useMemo(()=>managerCreateFields.map(field=>field.name==='branch_id'?{...field,options:[{value:'',label:'Select branch'},...branchOptions]}:field),[branchOptions]);
  const formFields=kind==='restaurants'&&mode==='edit'?restaurantEditFields:kind==='branches'&&branchScope==='restaurant'&&mode==='edit'?restaurantBranchEditFields:kind==='branches'&&branchScope==='restaurant'?restaurantBranchCreateFields:kind==='branches'&&mode==='edit'?branchUpdateFields:kind==='branches'?branchCreateFields:kind==='managers'&&branchScope==='restaurant'?managerCreateFormFields:kind==='customers'?customerUpdateFields:kind==='tables'?tableCreateFields:config.fields;
  const formInitial=mode==='edit'?active:null;
  const detailFields=kind==='restaurants'?config.fields.filter(field=>field.name!=='password'):kind==='branches'?branchListFields.filter(field=>!['created_at','updated_at'].includes(field.name)):config.fields;
  const displayFields=useMemo(()=>{if(kind==='restaurants')return restaurantListFields;if(kind==='branches')return branchScope==='admin'?branchListFields.filter(field=>field.name!=='address'):branchListFields;if(kind==='managers')return managerListFields;if(kind==='customers')return customerListFields;if(kind==='tables')return tableListFields;return config.fields.filter(field=>!['address','device_token','created_at','password'].includes(field.name))},[config,kind,branchScope]);
  const dataColumns=displayFields.map(field=>({key:field.name,label:field.label,render:value=>renderRegistryValue(field,value)}));
  const actionColumn={key:'actions',label:'Actions',sortable:false,className:'actions-col',render:(_,row)=><div className="row-actions"><button title="View" onClick={()=>{setActive(row);setMode('view')}}><Eye/></button>{!readOnly&&<button title="Edit" onClick={()=>{setActive(row);setMode('edit')}}><Pencil/></button>}</div>};
  const customerActionColumn={key:'actions',label:'Actions',sortable:false,className:'actions-col',render:(_,row)=><div className="row-actions"><button title="Update status" onClick={()=>{setActive(row);setMode('edit')}}><Pencil/></button></div>};
  const columns=['managers','tables'].includes(kind)?dataColumns:kind==='customers'?[...dataColumns,customerActionColumn]:[...dataColumns,actionColumn];
  const visibleRows=user.role===ROLES.MANAGER&&kind==='tables'?rows.filter(row=>String(row.branch_id)===String(user.branch_id)):rows;
  const canAdd=!readOnly&&kind!=='customers'&&(kind!=='managers'||branchScope==='restaurant');
  const changeManagerBranch=event=>{const nextBranch=event.target.value;setManagerBranchId(nextBranch);load({page:1,limit:10,search:''},nextBranch)};
  const managerBranchFilter=kind==='managers'&&branchScope==='restaurant'?<div className="table-card queue-branch-filter"><label className="field"><span>Branch</span><select value={managerBranchId} onChange={changeManagerBranch} disabled={loading}>{branchOptions.length?branchOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>):<option value="">No branches available</option>}</select></label></div>:null;
  const changeTableBranch=event=>{const nextBranch=event.target.value;setTableBranchId(nextBranch);load({page:1,limit:10,search:''},managerBranchId,nextBranch)};
  const tableBranchFilter=kind==='tables'&&branchScope==='restaurant'?<div className="table-card queue-branch-filter"><label className="field"><span>Branch</span><select value={tableBranchId} onChange={changeTableBranch} disabled={loading}>{branchOptions.length?branchOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>):<option value="">No branches available</option>}</select></label></div>:null;
  return <><PageHeader eyebrow="OPERATIONS" title={title||config.title} description={description||config.description} action={canAdd&&<button className="btn primary" onClick={()=>{setActive(null);setMode('add')}}><Plus size={17}/> Add {config.singular}</button>}/>{managerBranchFilter}{tableBranchFilter}{kind==='restaurants'?<ServerTable columns={columns} data={visibleRows} loading={loading} total={restaurantTotal} onQueryChange={load} searchPlaceholder="Search restaurants"/>:kind==='branches'?<ServerTable columns={columns} data={visibleRows} loading={loading} total={branchTotal} onQueryChange={load} searchPlaceholder="Search branches" minWidth={2100}/>:kind==='managers'?<ServerTable key={branchScope==='restaurant'?managerBranchId:'admin-managers'} columns={columns} data={visibleRows} loading={loading} total={managerTotal} onQueryChange={params=>load(params,managerBranchId)} searchPlaceholder="Search managers" minWidth={1500}/>:kind==='customers'?<ServerTable columns={columns} data={visibleRows} loading={loading} total={customerTotal} onQueryChange={load} searchPlaceholder="Search customers" minWidth={1200}/>:kind==='tables'?<ServerTable key={branchScope==='restaurant'?tableBranchId:'admin-tables'} columns={columns} data={visibleRows} loading={loading} total={tableTotal} onQueryChange={params=>load(params,managerBranchId,tableBranchId)} searchPlaceholder="Search tables" minWidth={900}/>:<CommonTable columns={columns} data={visibleRows} loading={loading} searchPlaceholder={`Search ${config.title.toLowerCase()}…`}/>}
    <Modal open={mode==='add'||mode==='edit'} title={`${mode==='edit'?'Edit':'Add'} ${config.singular}`} onClose={()=>{if(!saving)setMode(null)}} size="wide"><EntityForm initial={formInitial} fields={formFields} onCancel={()=>setMode(null)} onSubmit={save} onFormChange={()=>setFormError('')} submitLabel={mode==='edit'?'Save changes':`Add ${config.singular}`} busy={saving} formError={formError}/></Modal>
    <Modal open={mode==='view'} title={`${config.singular} details`} onClose={()=>setMode(null)} size="wide"><div className="registry-detail">{detailFields.map(field=><div key={field.name}><span>{field.label}</span><strong>{renderRegistryValue(field,active?.[field.name])}</strong></div>)}<div><span>Created at</span><strong>{active?.createdAt?new Date(active.createdAt).toLocaleString():'—'}</strong></div><div><span>Updated at</span><strong>{active?.updatedAt?new Date(active.updatedAt).toLocaleString():'—'}</strong></div></div><footer className="modal-actions"><button className="btn secondary" onClick={()=>setMode(null)}>Close</button>{!readOnly&&<button className="btn primary" onClick={()=>setMode('edit')}><Pencil size={16}/> Edit</button>}</footer></Modal>
  </>;
}
