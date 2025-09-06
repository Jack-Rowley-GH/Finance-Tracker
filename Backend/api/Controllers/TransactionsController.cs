namespace FinanceTracker.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TransactionsController> _logger;

        public TransactionsController(AppDbContext context, ILogger<TransactionsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/transactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetTransactions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? category = null,
            [FromQuery] TransactionType? type = null)
        {
            try
            {
                var userId = GetCurrentUserId();

                var query = _context.Transactions
                    .Where(t => t.UserId == userId);

                if (!string.IsNullOrEmpty(category))
                    query = query.Where(t => t.Category.ToLower().Contains(category.ToLower()));

                if (type.HasValue)
                    query = query.Where(t => t.Type == type.Value);

                var totalCount = await query.CountAsync();

                var transactions = await query
                    .OrderByDescending(t => t.Date)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(t => new TransactionDto
                    {
                        Id = t.Id,
                        Amount = t.Amount,
                        Description = t.Description,
                        Date = t.Date,
                        Category = t.Category,
                        Type = t.Type,
                        CreatedAt = t.CreatedAt
                    })
                    .ToListAsync();

                Response.Headers.Add("X-Total-Count", totalCount.ToString());
                Response.Headers.Add("X-Page", page.ToString());
                Response.Headers.Add("X-Page-Size", pageSize.ToString());

                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transactions");
                return StatusCode(500, new { message = "An error occurred while retrieving transactions" });
            }
        }

        // GET: api/transactions/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionDto>> GetTransaction(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                var transaction = await _context.Transactions
                    .Where(t => t.Id == id && t.UserId == userId)
                    .Select(t => new TransactionDto
                    {
                        Id = t.Id,
                        Amount = t.Amount,
                        Description = t.Description,
                        Date = t.Date,
                        Category = t.Category,
                        Type = t.Type,
                        CreatedAt = t.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (transaction == null)
                {
                    return NotFound(new { message = "Transaction not found" });
                }

                return Ok(transaction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction with ID {TransactionId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the transaction" });
            }
        }

        // POST: api/transactions
        [HttpPost]
        public async Task<ActionResult<TransactionDto>> CreateTransaction(CreateTransactionDto createDto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var transaction = new Transaction
                {
                    Amount = createDto.Amount,
                    Description = createDto.Description,
                    Date = createDto.Date,
                    Category = createDto.Category,
                    Type = createDto.Type,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                var responseDto = new TransactionDto
                {
                    Id = transaction.Id,
                    Amount = transaction.Amount,
                    Description = transaction.Description,
                    Date = transaction.Date,
                    Category = transaction.Category,
                    Type = transaction.Type,
                    CreatedAt = transaction.CreatedAt
                };

                return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating transaction");
                return StatusCode(500, new { message = "An error occurred while creating the transaction" });
            }
        }

        // PUT: api/transactions/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<TransactionDto>> UpdateTransaction(int id, UpdateTransactionDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var transaction = await _context.Transactions
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

                if (transaction == null)
                {
                    return NotFound(new { message = "Transaction not found" });
                }

                transaction.Amount = updateDto.Amount;
                transaction.Description = updateDto.Description;
                transaction.Date = updateDto.Date;
                transaction.Category = updateDto.Category;
                transaction.Type = updateDto.Type;

                await _context.SaveChangesAsync();

                var responseDto = new TransactionDto
                {
                    Id = transaction.Id,
                    Amount = transaction.Amount,
                    Description = transaction.Description,
                    Date = transaction.Date,
                    Category = transaction.Category,
                    Type = transaction.Type,
                    CreatedAt = transaction.CreatedAt
                };

                return Ok(responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating transaction with ID {TransactionId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the transaction" });
            }
        }

        // DELETE: api/transactions/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTransaction(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                var transaction = await _context.Transactions
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

                if (transaction == null)
                {
                    return NotFound(new { message = "Transaction not found" });
                }

                _context.Transactions.Remove(transaction);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting transaction with ID {TransactionId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the transaction" });
            }
        }

        // GET: api/transactions/summary
        [HttpGet("summary")]
        public async Task<ActionResult> GetSummary()
        {
            try
            {
                var userId = GetCurrentUserId();

                var currentMonth = DateTime.Now.Month;
                var currentYear = DateTime.Now.Year;

                var transactions = await _context.Transactions
                    .Where(t => t.UserId == userId && t.Date.Month == currentMonth && t.Date.Year == currentYear)
                    .ToListAsync();

                var totalIncome = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
                var totalExpenses = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);
                var balance = totalIncome - totalExpenses;

                var categoryBreakdown = transactions
                    .Where(t => t.Type == TransactionType.Expense)
                    .GroupBy(t => t.Category)
                    .Select(g => new { category = g.Key, amount = g.Sum(t => t.Amount) })
                    .OrderByDescending(x => x.amount)
                    .ToList();

                var summary = new
                {
                    totalIncome = totalIncome,
                    totalExpenses = totalExpenses,
                    balance = balance,
                    transactionCount = transactions.Count,
                    categoryBreakdown = categoryBreakdown,
                    month = currentMonth,
                    year = currentYear
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction summary");
                return StatusCode(500, new { message = "An error occurred while retrieving the summary" });
            }
        }

        // GET: api/transactions/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            try
            {
                var userId = GetCurrentUserId();
                var defaultCategories = new List<string>
        {
            "Food & Dining", "Transportation", "Shopping", "Entertainment",
            "Bills & Utilities", "Education", "Travel",
            "Coffee", "Restaurants", "Utilities",
            "Salary", "Business", "Investments", "Other"
        };

                var userCategories = await _context.Transactions
                    .Where(t => t.UserId == userId)
                    .Select(t => t.Category)
                    .Distinct()
                    .ToListAsync();

                var allCategories = defaultCategories
                    .Union(userCategories)
                    .OrderBy(c => c)
                    .ToList();

                return Ok(allCategories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return StatusCode(500, new { message = "An error occurred while retrieving categories" });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return userId;
        }
    }
}