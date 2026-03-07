const statuses = {
    requested: { label: 'Requested', cls: 'status-requested' },
    accepted: { label: 'Accepted', cls: 'status-accepted' },
    driver_arriving: { label: 'Driver Arriving', cls: 'status-driver_arriving' },
    in_progress: { label: 'In Progress', cls: 'status-in_progress' },
    completed: { label: 'Completed', cls: 'status-completed' },
    cancelled: { label: 'Cancelled', cls: 'status-cancelled' },
};

const StatusBadge = ({ status }) => {
    const s = statuses[status] || { label: status, cls: 'badge bg-dark-600 text-dark-300' };
    return <span className={s.cls}>{s.label}</span>;
};

export default StatusBadge;
