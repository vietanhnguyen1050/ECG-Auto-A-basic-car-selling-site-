import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Car, Tag } from 'lucide-react';
import UsersTab from '@/components/admin/UsersTab';
import CarsTab from '@/components/admin/CarsTab';
import BrandsTab from '@/components/admin/BrandsTab';

const Admin = () => {
  return (
    <Layout>
      <section className="py-8">
        <div className="container">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>
          <Tabs defaultValue="users">
            <TabsList className="mb-6">
              <TabsTrigger value="users" className="gap-1.5"><Users className="h-4 w-4" />Users</TabsTrigger>
              <TabsTrigger value="cars" className="gap-1.5"><Car className="h-4 w-4" />Cars</TabsTrigger>
              <TabsTrigger value="brands" className="gap-1.5"><Tag className="h-4 w-4" />Brands</TabsTrigger>
            </TabsList>
            <TabsContent value="users"><UsersTab /></TabsContent>
            <TabsContent value="cars"><CarsTab /></TabsContent>
            <TabsContent value="brands"><BrandsTab /></TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Admin;
