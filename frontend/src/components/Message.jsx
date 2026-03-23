const Message = ({ variant, children }) => {
    const bgColors = {
        danger: '#ffebee',
        success: '#e8f5e9',
        info: '#e3f2fd',
    };
    const textColors = {
        danger: '#c62828',
        success: '#2e7d32',
        info: '#1565c0',
    };

    return (
        <div style={{
            backgroundColor: bgColors[variant] || bgColors.info,
            color: textColors[variant] || textColors.info,
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontWeight: 500
        }}>
            {children}
        </div>
    );
};

export default Message;
