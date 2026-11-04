const services = JSON.parse(process.env.VCAP_SERVICES || '{}');

for (const [type, instances] of Object.entries(services)) {
  for (const service of instances) {
    console.log({
      type,
      name: service.name,
      plan: service.plan
    });
  }
}
