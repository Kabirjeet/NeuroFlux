import React,{useState}from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

const AppLayout = ({childern}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(flase);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  }
  return (
    <div className="flex h-screen bg-neutral-100 text-neutral-800">
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar}/>
        <main className='flex-1 overflow-x-hidden overflow-y-auto p-4'>
          {childern}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
