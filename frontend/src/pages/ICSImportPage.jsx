import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ICSUpload from '../components/ICSUpload';

export default function ICSImportPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/calendar"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calendar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Import Calendar Events
          </h1>
        </div>

        {/* Upload Component */}
        <ICSUpload />

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            About ICS Import
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>What is an ICS file?</strong> An ICS (iCalendar) file is a universal calendar format 
              that can be exported from most calendar applications including Google Calendar, Outlook, 
              Apple Calendar, and more.
            </p>
            <p>
              <strong>Supported features:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Single and recurring events</li>
              <li>Event titles, descriptions, and locations</li>
              <li>Start and end times with timezone support</li>
              <li>Automatic duplicate detection</li>
              <li>Recurrence expansion (up to 100 instances or 2 years)</li>
            </ul>
            <p>
              <strong>File requirements:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>File must have .ics extension</li>
              <li>Maximum file size: 10MB</li>
              <li>Must be a valid iCalendar format (RFC 5545)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
