import React, { useState } from 'react';

const Customers = () => {
  const [customers, setCustomers] = useState([
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', phone: '0551234567', orders: 3 },
    { id: 2, name: 'فاطمة عبدالله', email: 'fatima@example.com', phone: '0557654321', orders: 1 },
    { id: 3, name: 'خالد سعيد', email: 'khaled@example.com', phone: '0559876543', orders: 2 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCustomer = {
      id: customers.length + 1,
      ...formData,
      orders: 0
    };
    setCustomers([...customers, newCustomer]);
    setFormData({
      name: '',
      email: '',
      phone: '',
    });
    setShowForm(false);
  };

  const deleteCustomer = (id) => {
    setCustomers(customers.filter(customer => customer.id !== id));
  };

  return (
    <div>
      <div className="card-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>إدارة العملاء</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>إضافة عميل جديد</button>
      </div>

      {showForm && (
        <div className="card" style={{marginBottom: '20px'}}>
          <h3>إضافة عميل جديد</h3>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col">
                <input 
                  type="text" 
                  name="name" 
                  placeholder="اسم العميل" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                  style={{width: '100%', padding: '10px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px'}}
                />
              </div>
              <div className="col">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="البريد الإلكتروني" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                  style={{width: '100%', padding: '10px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px'}}
                />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <input 
                  type="text" 
                  name="phone" 
                  placeholder="رقم الهاتف" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  required 
                  style={{width: '100%', padding: '10px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px'}}
                />
              </div>
            </div>
            <div style={{marginTop: '10px'}}>
              <button type="submit" className="btn btn-success">حفظ</button>
              <button type="button" className="btn btn-danger" onClick={() => setShowForm(false)} style={{marginLeft: '10px'}}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>البريد الإلكتروني</th>
                <th>رقم الهاتف</th>
                <th>عدد الطلبات</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.orders}</td>
                  <td>
                    <button className="btn btn-warning" style={{marginRight: '5px'}}>تعديل</button>
                    <button className="btn btn-danger" onClick={() => deleteCustomer(customer.id)}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;