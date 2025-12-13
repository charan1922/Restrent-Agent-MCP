import { useTenant } from "@/hooks/use-tenant";

export function ExampleUsage() {
    const { tenantName, primaryColor, isLoading, error } = useTenant();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1 style={{ color: primaryColor }}>
                Welcome to {tenantName}
            </h1>
            <p>Your primary brand color is: {primaryColor}</p>
        </div>
    );
}
