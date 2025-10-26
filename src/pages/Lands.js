import React, { useState } from 'react';

const Lands = () => {
  const [lands, setLands] = useState([
    { id: 1, name: 'أرض سكنية - الرياض', area: '500 م²', price: '750,000 ريال', location: 'الرياض', status: 'متاحة' },
    { id: 2, name: 'أرض تجارية - جدة', area: '300 م²', price: '1,200,000 ريال', location: 'جدة', status: 'محجوزة' },
    { id: 3, name: 'أرض زراعية - القصيم', area: '1000 م²', price: '500,000 ريال', location: 'القصيم', status: 'متاحة' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    price: '',
    location: '',
    status: 'متاحة'
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
    const newLand = {
      id: lands.length + 1,
      ...formData
    };
    setLands([...lands, newLand]);
    setFormData({
      name: '',
      area: '',
      price: '',
      location: '',
      status: 'متاحة'
    });
    setShowForm(false);
  };

  const deleteLand = (id) => {
    setLands(lands.filter(land => land.id !== id));
  };

  return (
    <div>
      <div className="card-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>إدارة الأراضي</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>إضافة أرض جديدة</button>
      </div>

      {showForm && (
        <div className="card" style={{marginBottom: '20px'}}>
          <h3>إضافة أرض جديدة</h3>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col">
                <input 
                  type="text" 
                  name="name" 
                  placeholder="اسم الأرض" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                  style={{width: '100%', padding: '10px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px'}}
                />
              </div>
              <div className="col">
                <input 
                  type="text" 
                  name="area" 
                  placeholder="المساحة" 
                  value={formData.area}
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
                  name="price" 
                  placeholder="السعر" 
                  value={formData.price}
                  onChange={handleInputChange}
                  required 
                  style={{width: '100%', padding: '10px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px'}}
                />
              </div>
              <div className="col">
                <input 
                  type="text" 
                  name="location" 
                  placeholder="الموقع" 
                  value={formData.location}
                  onChange={handleInputChange}
                  required 
                  style={{width: '100%', padding: '10px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px'}}
                />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <select 
                  name="status" 
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '10px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px'}}
                >
                  <option value="متاحة">متاحة</option>
                  <option value="محجوزة">محجوزة</option>
                  <option value="مباعة">مباعة</option>
                </select>
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
                <th>اسم الأرض</th>
                <th>المساحة</th>
                <th>السعر</th>
                <th>الموقع</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {lands.map(land => (
                <tr key={land.id}>
                  <td>{land.name}</td>
                  <td>{land.area}</td>
                  <td>{land.price}</td>
                  <td>{land.location}</td>
                  <td>
                    <span style={{
                      color: land.status === 'متاحة' ? 'green' : 
                             land.status === 'محجوزة' ? 'orange' : 'red'
                    }}>
                      {land.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-warning" style={{marginRight: '5px'}}>تعديل</button>
                    <button className="btn btn-danger" onClick={() => deleteLand(land.id)}>حذف</button>
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

export default Lands;