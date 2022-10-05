# DragDropList
Customizable drag and drop list component made with Javascript. (Soon for react)
## Usage
    <html>
    	<head>
    	</head>
    	<body>
    		<div id='root'></div>
    		<script src='[path]/drag-drop-list.min.js'></script>
    		<script>
    			const dditems = new DragDropList({
    				name: `dragdrop`,
    				root: 'root',
    				css: `#root .dragdrop-item {
    					border: solid 1px #DDD;
    					padding: 10px;
    					margin: 2px 0;
    					background-color: #FFF;
    				}`,
    				onLoad: (args) =>{
    					console.log(args.target);
    				},
    				onChange: (args) =>{
    					console.log(args.origin, args.target);
    				},
    				items: (() =>{
    					let buffer = [];
    					for(let i = 0; i < 10; i++)
    						buffer.push({html: `test ${i} <button id='item-${i}'>button ${i + 1}</button>`});
    					return buffer;
    				})()
    			});
    		</script>
    	</body>
    </html>

