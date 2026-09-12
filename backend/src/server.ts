import app from "./app";
import { env } from "./config/env";

const PORT = env.PORT;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT} [${env.NODE_ENV}]`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
