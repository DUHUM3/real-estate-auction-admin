import React from 'react';

const ContactsPagination = ({ pagination, paginationInfo, onPageChange }) => {
  if (pagination.last_page <= 1) {
    return null;
  }

  return (
    <div className="bg-white px-6 py-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          عرض <span className="font-medium">{paginationInfo.start}</span> إلى{' '}
          <span className="font-medium">{paginationInfo.end}</span> من{' '}
          <span className="font-medium">{pagination.total}</span> نتيجة
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={() => onPageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            السابق
          </button>

          {/* Page Numbers */}
          {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === pagination.last_page ||
                Math.abs(page - pagination.current_page) <= 2
            )
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="px-3 py-1 text-sm text-gray-500">...</span>
                )}
                <button
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${
                    page === pagination.current_page
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            ))}

          <button
            onClick={() => onPageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactsPagination;