import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL + '/api/event-tickets';

function EventTicket({ eventId }) {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({
    ticket_name: '',
    cost: '',
    ticket_available_date: '',
    _id: null
  });
  const [editing, setEditing] = useState(false);

  // 取得票券
  const fetchTickets = async () => {
    if (!eventId) return;
    const res = await fetch(`${API_URL}/event/${eventId}`);
    const data = await res.json();
    setTickets(data);
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line
  }, [eventId]);

  // 處理表單
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 新增/編輯票券
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      cost: Number(form.cost),
      event: eventId
    };
    if (editing) {
      await fetch(`${API_URL}/${form._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setForm({ ticket_name: '', cost: '', ticket_available_date: '', _id: null });
    setEditing(false);
    fetchTickets();
  };

  // 編輯
  const handleEdit = (ticket) => {
    setForm({ ...ticket, cost: ticket.cost || '', _id: ticket._id });
    setEditing(true);
  };

  // 刪除票券
  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTickets();
  };

  return (
    <div className="mt-4">
      <h5>Event Tickets</h5>
      <form onSubmit={handleSubmit} className="mb-3 row g-2 align-items-end">
        <div className="col-md-3">
          <input type="text" className="form-control" name="ticket_name" placeholder="Ticket Name" value={form.ticket_name} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" name="cost" placeholder="Cost" value={form.cost} onChange={handleChange} required />
        </div>
        <div className="col-md-3">
          <input type="date" className="form-control" name="ticket_available_date" value={form.ticket_available_date ? form.ticket_available_date.slice(0,10) : ''} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
        </div>
      </form>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Cost</th>
            <th>Available Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket._id}>
              <td>{ticket.ticket_name}</td>
              <td>{ticket.cost}</td>
              <td>{ticket.ticket_available_date ? ticket.ticket_available_date.slice(0,10) : ''}</td>
              <td>
                <button className="btn btn-sm btn-secondary me-2" onClick={() => handleEdit(ticket)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ticket._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EventTicket; 