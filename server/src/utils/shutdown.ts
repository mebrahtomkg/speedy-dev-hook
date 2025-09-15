const shutdown = (info?: string) => {
  if (info) console.log(info);

  console.log('Exiting...');

  process.exit(0);
};

export default shutdown;
