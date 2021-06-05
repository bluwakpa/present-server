module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    // DATABASE_URL: process.env.DATABASE_URL || 'postgresql://bluwakpa@localhost:5432/present',
    DATABASE_URL: process.env.DATABASE_URL || 'postgres://njeribiuorsjpb:8e704c22422866a010f6122ee0ad9e769f6e5705507f0f56105514d504ffe944@ec2-34-225-103-117.compute-1.amazonaws.com:5432/dbv0ue3skg1ds',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost/present-test'
  }