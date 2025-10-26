import React, { useState } from 'react';

const Orders = () => {
  const [orders, setOrders] = useState([
    { id: 1, orderNumber: '#ORD-001', customer: 'أحمد محمد', land: 'أرض سكنية - الرياض', amount: '750,000 ريال', status: 'مكتمل', date: '2023-10-15' },
    { id: 2, orderNumber: '#ORD-002', customer: 'فاطمة عبدالله', land: 'أرض تجارية - جدة', amount: '1,200,000 ريال', status: 'قيد المراجعة', date: '2023-10-18' },
    { id: 3, orderNumber: '#ORD-003', customer: 'خالد سعيد', land: 'أرض زراعية - القصيم', amount: '500,000 ريال', status: 'ملغي', date: '2023-10-20' },
  ]);

  const updateOrderStatus = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const deleteOrder = (id) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  return (
    <div>
      <h2>إدارة الطلبات</h2>
      
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>العميل</th>
                <th>الأرض</th>
                <th>المبلغ</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customer}</td>
                  <td>{order.land}</td>
                  <td>{order.amount}</td>
                  <td>{order.date}</td>
                  <td>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      style={{
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        color: order.status === 'مكتمل' ? 'green' : 
                               order.status === 'قيد المراجعة' ? 'orange' : 'red'
                      }}
                    >
                      <option value="مكتمل">مكتمل</option>
                      <option value="قيد المراجعة">قيد المراجعة</option>
                      <option value="ملغي">ملغي</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-warning" style={{marginRight: '5px'}}>تفاصيل</button>
                    <button className="btn btn-danger" onClick={() => deleteOrder(order.id)}>حذف</button>
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

export default Orders;