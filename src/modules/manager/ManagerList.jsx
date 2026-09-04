import EntityPage from '../../components/common/EntityPage';
const fields=[{name:'name',label:'Full name',placeholder:'e.g. Aarav Mehta'},{name:'email',label:'Email address',type:'email',placeholder:'name@company.com'},{name:'phone',label:'Phone number',placeholder:'+91 98765 43210'},{name:'image',label:'Profile image',required:false}];
export default function ManagerList(){return <EntityPage type="managers" singular="Manager" title="Managers" description="Add and manage the people responsible for your operations." fields={fields} withSelect/>}

