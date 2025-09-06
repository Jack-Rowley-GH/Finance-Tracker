namespace FinanceTracker.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(AppDbContext context, AuthService authService, ILogger<AuthController> logger)
        {
            _context = context;
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                {
                    return BadRequest(new { message = "User with this email already exists" });
                }

                var user = new User
                {
                    Name = registerDto.Name,
                    Email = registerDto.Email,
                    PasswordHash = _authService.HashPassword(registerDto.Password),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var token = _authService.GenerateJwtToken(user);

                var response = new AuthResponseDto
                {
                    Token = token,
                    Name = user.Name,
                    Email = user.Email,
                    ExpiresAt = DateTime.UtcNow.AddDays(7)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return StatusCode(500, new { message = "An error occurred during registration" });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

                if (user == null)
                {
                    return BadRequest(new { message = "Invalid email or password" });
                }

                if (!_authService.VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    return BadRequest(new { message = "Invalid email or password" });
                }

                var token = _authService.GenerateJwtToken(user);

                var response = new AuthResponseDto
                {
                    Token = token,
                    Name = user.Name,
                    Email = user.Email,
                    ExpiresAt = DateTime.UtcNow.AddDays(7)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user login");
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        [HttpGet("validate")]
        public async Task<ActionResult> ValidateToken()
        {
            return Ok(new { message = "Token is valid", isValid = true });
        }
    }
}