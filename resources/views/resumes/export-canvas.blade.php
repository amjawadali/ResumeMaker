<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume Export</title>
    <script src="https://unpkg.com/konva@9/konva.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Merriweather:wght@400;700;900&family=Fira+Code:wght@400;700&family=Poppins:wght@400;700;900&family=Playfair+Display:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body, html { margin: 0; padding: 0; overflow: hidden; background: white; font-family: 'Plus Jakarta Sans', sans-serif; }
        #export-container { width: 794px; height: 1123px; }
    </style>
</head>
<body>
    <div id="export-container"></div>
    <script>
        const canvasState = @js($resume->canvas_state);
        if (canvasState) {
            const stage = Konva.Node.create(JSON.stringify(canvasState), 'export-container');
            
            // Hide selection tools if any saved by mistake
            const transformer = stage.findOne('Transformer');
            if (transformer) transformer.destroy();
            
            stage.draw();
        }
    </script>
</body>
</html>
