const Koa = require('koa')

const app = new Koa()

app.use(ctx => {
	ctx.body = "hello world: madcamp!"
})

app.listen(80, () => {
	console.log("Listening to port 8080")
})