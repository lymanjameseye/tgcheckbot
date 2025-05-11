const { Telegraf } = require('telegraf');
const mysql = require('mysql2/promise'); // Use promise-based API for async/await

const botToken = 'YOUR_BOT_TOKEN';
const bot = new Telegraf(botToken);

// MySQL Connection Configuration
const dbConfig = {
  host: 'YOUR_MYSQL_HOST', // e.g., 'localhost'
  user: 'YOUR_MYSQL_USER',
  password: 'YOUR_MYSQL_PASSWORD',
  database: 'YOUR_MYSQL_DATABASE',
};

// Helper function to get database connection
async function getConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        return connection;
    } catch (error) {
        console.error("Error connecting to database:", error);
        throw error; // Re-throw to handle it in the command
    }
}

// Middleware to check if the command is used in a group
bot.use(async (ctx, next) => {
    if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
        await next();
    } else {
        ctx.reply('This command can only be used in a group.');
    }
});

bot.start((ctx) => {
  ctx.reply('Welcome! Use /check <user_id> to see verification status.');
});

bot.command('check', async (ctx) => {
  const userId = ctx.message.text.split(' ')[1];

  if (!userId) {
    return ctx.reply('Please provide a user ID. Example: /check 123456789');
  }

  const numericUserId = parseInt(userId); // Convert to number for checking

  if (isNaN(numericUserId)) {
        return ctx.reply('Invalid user ID.  Please provide a numeric user ID.');
  }

  let connection;
  try {
    connection = await getConnection();

    // Query the database to get user verification data
    const [rows] = await connection.execute(
      'SELECT isVerified, verifiedFor FROM verifications WHERE userId = ?',
      [numericUserId]
    );

    if (rows.length > 0) {
      const userData = rows[0];
      if (userData.isVerified) {
        ctx.reply(
          `User ${userId} is verified for: ${userData.verifiedFor}`
        );
      } else {
        ctx.reply(`User ${userId} is not verified.`);
      }
    } else {
      ctx.reply(`User ${userId} not found in verification database.`);
    }
  } catch (error) {
    console.error('Error during database query:', error);
    return ctx.reply('An error occurred while checking the user.'); // Inform the user
  } finally {
    if (connection) {
      await connection.end(); // Close the connection
    }
  }
});

bot.catch((err, ctx) => {
    console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot is running!');
