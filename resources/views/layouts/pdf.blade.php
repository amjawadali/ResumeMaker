<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        /* Base Styles for PDF */
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11pt; color: #333; margin: 0; padding: 0; }
        .page { padding: 40px; }
        h1, h2, h3, h4 { margin: 0 0 10px 0; color: #111; }
        p { margin: 0 0 8px 0; }
        .text-sm { font-size: 9pt; }
        .text-xs { font-size: 8pt; }
        .font-bold { font-weight: bold; }
        .text-gray-500 { color: #6b7280; }
        .text-indigo-600 { color: #4f46e5; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mt-4 { margin-top: 16px; }
        .grid { width: 100%; display: table; }
        .col { display: table-cell; vertical-align: top; }
        .w-1/3 { width: 33.33%; }
        .w-2/3 { width: 66.66%; }
        .pr-8 { padding-right: 32px; }
    </style>
    @yield('styles')
</head>
<body>
    <div class="page">
        @yield('content')
    </div>
</body>
</html>
