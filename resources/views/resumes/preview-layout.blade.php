<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Merriweather:wght@400;700;900&family=Fira+Code:wght@400;700&family=Poppins:wght@400;700;900&family=Lato:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Playfair+Display:wght@400;700;900&family=Raleway:wght@400;700;900&family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: transparent;
        }
        /* Custom scrollbar for some browsers */
        ::-webkit-scrollbar {
            width: 0px;
        }
    </style>
</head>
<body class="bg-white">
    @include($template_view, array_merge($data, ['mode' => $data['mode'] ?? 'preview']))
</body>
</html>
