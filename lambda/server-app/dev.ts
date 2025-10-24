import { config } from './config';
import { app } from './app';

const port = config.PORT;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${[port]}`);
});
