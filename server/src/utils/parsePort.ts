const parsePort = (): number | null => {
  const args = process.argv;
  let port: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port') {
      port = args[i + 1];
      break;
    }
  }

  if (typeof port === 'string' && port) {
    return Number.parseInt(port, 10);
  }

  return null;
};

export default parsePort;
