import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
export default function BranchDashboard() {
  const {user} = useAuth();
  return <>
    <PageHeader eyebrow="BRANCH OWNER" title={`Welcome, ${user.name}`} description="You are signed in to your branch workspace."/>
    <section className="panel"><header><div><h2>Your account</h2><p>Branch owner details</p></div></header><div className="registry-detail">
      {[['Name',user.name],['Email',user.email],['Phone',user.phone],['Status',user.status],['Branch',user.branch_name || user.branch?.name || (user.branch_id != null ? `Branch ${user.branch_id}` : null)]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value || '-'}</strong></div>)}
    </div></section>
  </>;
}
